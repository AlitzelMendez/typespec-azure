import {
  $tag,
  DecoratorContext,
  getTags,
  Interface,
  isGlobalNamespace,
  Model,
  Operation,
  Program,
  Type,
} from "@typespec/compiler";
import { $autoRoute, getParentResource, getSegment } from "@typespec/rest";
import { reportDiagnostic } from "./lib.js";
import { getArmProviderNamespace, isArmLibraryNamespace } from "./namespace.js";
import { ArmResourceOperations, resolveResourceOperations } from "./operations.js";
import { getArmResource, listArmResources } from "./private.decorators.js";
import { ArmStateKeys } from "./state.js";

export type ArmResourceKind = "Tracked" | "Proxy" | "Extension";

/**
 * Interface for ARM resource detail base.
 *
 * @interface
 */
export interface ArmResourceDetailsBase {
  name: string;
  kind: ArmResourceKind;
  armProviderNamespace: string;
  keyName: string;
  collectionName: string;
  typespecType: Model;
}

export interface ArmResourceDetails extends ArmResourceDetailsBase {
  operations: ArmResourceOperations;
  resourceTypePath?: string;
}

function resolveArmResourceDetails(
  program: Program,
  resource: ArmResourceDetailsBase
): ArmResourceDetails {
  // Combine fully-resolved operation details with the base details we already have
  const operations = resolveResourceOperations(program, resource.typespecType);

  // Calculate the resource type path from the itemPath
  // TODO: This is currently a problem!  We don't have a canonical path to use for the itemPath
  const itemPath = (operations.lifecycle.read || operations.lifecycle.createOrUpdate)?.path;
  const baseType = getResourceBaseType(program, resource.typespecType);
  const resourceTypePath = getResourceTypePath(resource, itemPath, baseType);

  return {
    ...resource,
    operations,
    resourceTypePath,
  };
}

function getResourceTypePath(
  resource: ArmResourceDetailsBase,
  itemPath: string | undefined,
  baseType: ResourceBaseType
): string | undefined {
  if (!itemPath) {
    return undefined;
  }

  // Don't calculate resourceTypePath for tenant-level or extension resources
  if (baseType === ResourceBaseType.Tenant || baseType === ResourceBaseType.Extension) {
    return undefined;
  }

  // For other resources we start with a path that looks like: /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Contoso/Databases/{DatabaseName}/
  // We want to move to a path that looks like this: /subscriptions/{subscriptionId}/providers/Microsoft.Contoso/Databases/
  // To do so, we need to:
  // 1) Cut out the resource name from the item path
  let temporaryPath;
  const index = itemPath.indexOf(resource.collectionName);
  if (index !== -1) {
    const truncatedPath = itemPath.slice(0, index + resource.collectionName.length);
    temporaryPath = truncatedPath;
  } else {
    temporaryPath = itemPath;
  }

  // 2) If the resource is rg-scoped, trim off the resourceGroups segments
  const pattern = /\/resourceGroups\/{[^}]+}/;
  temporaryPath = temporaryPath.replace(pattern, "");

  // 3) Trim off all the other `{}` sections (e.g. {ParentResourceName}), minus the {subscriptionId}
  const pattern1 = /\/{(?!subscriptionId)[^}]+}/; //;
  return temporaryPath.replace(pattern1, "");
}

/**
 *  This function returns fully-resolved details about all ARM resources
 *  registered in the TypeSpec document including operations and their details.
 *
 *  It should only be called after the full TypeSpec document has been compiled
 *  so that operation route details are certain to be present.
 */
export function getArmResources(program: Program): ArmResourceDetails[] {
  // Have we cached the resolved resource details already?
  const cachedResources = program.stateMap(ArmStateKeys.armResourcesCached);
  if (cachedResources.size > 0) {
    // Return the cached resource details
    return Array.from(
      program.stateMap(ArmStateKeys.armResourcesCached).values()
    ) as ArmResourceDetails[];
  }

  // We haven't generated the full resource details yet
  const resources: ArmResourceDetails[] = [];
  for (const resource of listArmResources(program)) {
    const fullResource = resolveArmResourceDetails(program, resource);
    cachedResources.set(resource.typespecType, fullResource);
    resources.push(fullResource);
  }

  return resources;
}

export { getArmResource } from "./private.decorators.js";

export function getArmResourceInfo(
  program: Program,
  resourceType: Model
): ArmResourceDetails | undefined {
  const resourceInfo = getArmResource(program, resourceType);

  if (
    !resourceInfo &&
    resourceType.namespace !== undefined &&
    !isArmLibraryNamespace(program, resourceType.namespace)
  ) {
    reportDiagnostic(program, {
      code: "arm-resource-missing",
      format: { type: resourceType.name },
      target: resourceType,
    });
  }

  return resourceInfo;
}

export function getArmResourceKind(resourceType: Model): ArmResourceKind | undefined {
  if (resourceType.baseModel) {
    const coreType = resourceType.baseModel;
    if (coreType.name.startsWith("TrackedResource")) {
      return "Tracked";
    } else if (coreType.name.startsWith("ProxyResource")) {
      return "Proxy";
    } else if (coreType.name.startsWith("ExtensionResource")) {
      return "Extension";
    }
  }

  return undefined;
}

/**
 * This decorator is used to identify interfaces containing resource operations.
 * When applied, it marks the interface with the `@autoRoute` decorator so that
 * all of its contained operations will have their routes generated
 * automatically.
 *
 * It also adds a `@tag` decorator bearing the name of the interface so that all
 * of the operations will be grouped based on the interface name in generated
 * clients.
 */
export function $armResourceOperations(context: DecoratorContext, interfaceType: Interface): void {
  const { program } = context;

  // All resource interfaces should use @autoRoute
  context.call($autoRoute, interfaceType);

  // If no tag is given for the interface, tag it with the interface name
  if (getTags(program, interfaceType).length === 0) {
    context.call($tag, interfaceType, interfaceType.name);
  }
}

/**
 * This decorator is used to mark a resource type as a "singleton", a type with
 * only one instance.  The standard set of resource operations can be applied to
 * such a resource type, they will generate the correct routes and parameter
 * lists.
 */
export function $singleton(
  context: DecoratorContext,
  resourceType: Model,
  keyValue: string = "default"
): void {
  context.program.stateMap(ArmStateKeys.armSingletonResources).set(resourceType, keyValue);
}

export function isSingletonResource(program: Program, resourceType: Model): boolean {
  return program.stateMap(ArmStateKeys.armSingletonResources).has(resourceType);
}

export function getSingletonResourceKey(program: Program, resourceType: Model): string | undefined {
  return program.stateMap(ArmStateKeys.armSingletonResources).get(resourceType);
}

export enum ResourceBaseType {
  Tenant = "Tenant",
  Subscription = "Subscription",
  Location = "Location",
  ResourceGroup = "ResourceGroup",
  Extension = "Extension",
}

export function $tenantResource(context: DecoratorContext, entity: Model) {
  setResourceBaseType(context.program, entity, "Tenant");
}

export function $subscriptionResource(context: DecoratorContext, entity: Model) {
  setResourceBaseType(context.program, entity, "Subscription");
}

export function $locationResource(context: DecoratorContext, entity: Model) {
  setResourceBaseType(context.program, entity, "Location");
}

export function $resourceGroupResource(context: DecoratorContext, entity: Model) {
  setResourceBaseType(context.program, entity, "ResourceGroup");
}

export function $extensionResource(context: DecoratorContext, entity: Model) {
  setResourceBaseType(context.program, entity, "Extension");
}

export function $armProviderNameValue(context: DecoratorContext, entity: Operation) {
  const armProvider = getServiceNamespace(context.program, entity);
  if (armProvider === undefined) return;
  for (const [_, property] of entity.parameters.properties) {
    const segment = getSegment(context.program, property);
    if (segment === "providers" && property.type.kind === "String")
      property.type.value = armProvider;
  }
}

function getServiceNamespace(program: Program, type: Type | undefined): string | undefined {
  if (type === undefined) return undefined;
  switch (type.kind) {
    case "Operation":
      return (
        getServiceNamespace(program, type.namespace) ?? getServiceNamespace(program, type.interface)
      );
    case "Interface":
      return getServiceNamespace(program, type.namespace);
    case "Namespace":
      return (
        getArmProviderNamespace(program, type) ??
        (isGlobalNamespace(program, type)
          ? undefined
          : getServiceNamespace(program, type.namespace))
      );
    default:
      return undefined;
  }
}

function setResourceBaseType(program: Program, resource: Model, type: string) {
  if (program.stateMap(ArmStateKeys.resourceBaseType).has(resource)) {
    reportDiagnostic(program, {
      code: "arm-resource-duplicate-base-parameter",
      target: resource,
    });
  }

  program.stateMap(ArmStateKeys.resourceBaseType).set(resource, type);
}

export function getResourceBaseType(program: Program, resource: Model): ResourceBaseType {
  const parentTracker = new Set<Model>();
  let parent = getParentResource(program, resource);
  while (parent !== undefined) {
    if (parentTracker.has(parent))
      reportDiagnostic(program, { code: "arm-resource-circular-ancestry", target: resource });
    parentTracker.add(parent);
    resource = parent;
    parent = getParentResource(program, resource);
  }
  const keyValue: string | undefined = program
    .stateMap(ArmStateKeys.resourceBaseType)
    .get(resource);
  return resolveResourceBaseType(keyValue);
}

export function resolveResourceBaseType(type?: string | undefined): ResourceBaseType {
  let resolvedType: ResourceBaseType = ResourceBaseType.ResourceGroup;
  if (type !== undefined) {
    switch (type) {
      case "Tenant":
        resolvedType = ResourceBaseType.Tenant;
        break;
      case "Subscription":
        resolvedType = ResourceBaseType.Subscription;
        break;
      case "Location":
        resolvedType = ResourceBaseType.Location;
        break;
      case "ResourceGroup":
        resolvedType = ResourceBaseType.ResourceGroup;
        break;
      case "Extension":
        resolvedType = ResourceBaseType.Extension;
        break;
    }
  }
  return resolvedType;
}