import type { DecoratorContext, Model, ModelProperty, Operation, Type } from "@typespec/compiler";

/**
 *
 *
 *
 * @param values Values
 */
export type ResourceParameterBaseForDecorator = (
  context: DecoratorContext,
  target: ModelProperty,
  values: Type,
) => void;

/**
 *
 *
 *
 * @param propertyName Name of the property to omit
 */
export type ResourceBaseParametersOfDecorator = (
  context: DecoratorContext,
  target: Model,
  propertyName: Model,
) => void;

/**
 * Please DO NOT USE in RestAPI specs.
 * Internal decorator that deprecated direct usage of `x-ms-client-flatten` OpenAPI extension.
 * It will programatically enabled/disable client flattening with
 *
 * @flattenProperty with autorest
 * emitter flags to maintain compatibility in swagger.
 */
export type ConditionalClientFlattenDecorator = (
  context: DecoratorContext,
  target: ModelProperty,
) => void;

/**
 * Omit a property in the target model.
 *
 * @internal
 *
 *
 * @param propertyName Name of the property to omit
 */
export type OmitIfEmptyDecorator = (
  context: DecoratorContext,
  target: Model,
  propertyName: string,
) => void;

/**
 *
 *
 *
 * @param resource Resource model
 */
export type AssignProviderNameValueDecorator = (
  context: DecoratorContext,
  target: ModelProperty,
  resource: Model,
) => void;

/**
 * This decorator is used to identify Azure Resource Manager resource. In generated
 * swagger definition, it will be marked with `x-ms-azure-resource`.
 *
 * It is *not* meant to be used directly by a spec author,
 */
export type AzureResourceBaseDecorator = (context: DecoratorContext, target: Model) => void;

/**
 * Update the Azure Resource Manager provider namespace for a given entity.
 */
export type ArmUpdateProviderNamespaceDecorator = (
  context: DecoratorContext,
  target: Operation,
) => void;

/**
 *
 *
 *
 * @param resource Resource model
 */
export type AssignUniqueProviderNameValueDecorator = (
  context: DecoratorContext,
  target: ModelProperty,
  resource: Model,
) => void;

/**
 * This decorator is used to identify Azure Resource Manager resource types and extract their
 * metadata.  It is *not* meant to be used directly by a spec author, it instead
 * gets implicitly applied when the spec author defines a model type in this form:
 *
 * `model Server is TrackedResource<ServerProperties>;`
 *
 * The `TrackedResource<Resource>` type (and other associated base types) use the
 * `@armResource` decorator, so it also gets applied to the type which absorbs the
 * `TrackedResource<Resource>` definition by using the `is` keyword.
 *
 * @param properties Azure Resource Manager resource properties
 */
export type ArmResourceInternalDecorator = (
  context: DecoratorContext,
  target: Model,
  properties: Model,
) => void;

/**
 * Provides default name decoration on resource name property with
 * camelcased and pluralized key and segment name
 */
export type DefaultResourceKeySegmentNameDecorator = (
  context: DecoratorContext,
  target: ModelProperty,
  armResource: Model,
  keyName: string,
  segment: string,
) => void;

/**
 * Provides strict contraint type check.
 *
 * Due to TypeSpec language and all optional properties of `Foundations.Resource`,
 * the `Resource extends Foundations.SimpleResource` on many of the standard ARM templates is
 * essentially equal to `Resource extends {}` and does not enforce the containt.
 *
 * Note, this is intended for internal use only for now.
 */
export type EnforceConstraintDecorator = (
  context: DecoratorContext,
  target: Operation | Model,
  sourceType: Model,
  constraintType: Model,
) => void;

/**
 * Marks the operation as being a collection action
 *
 * @param resourceType Resource
 * @param parentTypeName : Parent type name.
 * @param parentFriendlyTypeName Friendly name for parent.
 * @param applyOperationRename If true, apply both doc and operation name update
 */
export type ArmRenameListByOperationDecorator = (
  context: DecoratorContext,
  target: Operation,
  resourceType: Model,
  parentTypeName?: string,
  parentFriendlyTypeName?: string,
  applyOperationRename?: boolean,
) => void;

/**
 * Please DO NOT USE in RestAPI specs.
 * This decorator is used to adjust optionality on ARM Resource's `properties` field for brownfield service conversion.
 */
export type ArmResourcePropertiesOptionalityDecorator = (
  context: DecoratorContext,
  target: ModelProperty,
  isOptional: boolean,
) => void;

/**
 * designates a parameter as an explicit bodyRoot and sets the optionality of the parameter
 */
export type ArmBodyRootDecorator = (
  context: DecoratorContext,
  target: ModelProperty,
  isOptional: boolean,
) => void;

export type AzureResourceManagerPrivateDecorators = {
  resourceParameterBaseFor: ResourceParameterBaseForDecorator;
  resourceBaseParametersOf: ResourceBaseParametersOfDecorator;
  conditionalClientFlatten: ConditionalClientFlattenDecorator;
  omitIfEmpty: OmitIfEmptyDecorator;
  assignProviderNameValue: AssignProviderNameValueDecorator;
  azureResourceBase: AzureResourceBaseDecorator;
  armUpdateProviderNamespace: ArmUpdateProviderNamespaceDecorator;
  assignUniqueProviderNameValue: AssignUniqueProviderNameValueDecorator;
  armResourceInternal: ArmResourceInternalDecorator;
  defaultResourceKeySegmentName: DefaultResourceKeySegmentNameDecorator;
  enforceConstraint: EnforceConstraintDecorator;
  armRenameListByOperation: ArmRenameListByOperationDecorator;
  armResourcePropertiesOptionality: ArmResourcePropertiesOptionalityDecorator;
  armBodyRoot: ArmBodyRootDecorator;
};
