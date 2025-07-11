import { createTypeSpecLibrary, paramMessage } from "@typespec/compiler";

export const $lib = createTypeSpecLibrary({
  name: "@azure-tools/typespec-azure-resource-manager",
  diagnostics: {
    "single-arm-provider": {
      severity: "error",
      messages: {
        default: "Only one @armProviderNamespace can be declared in a typespec spec at once.",
      },
    },
    "decorator-param-wrong-type": {
      severity: "error",
      messages: {
        armUpdateProviderNamespace:
          "The parameter to @armUpdateProviderNamespace must be an operation with a 'provider' parameter.",
        armIdentifiersIncorrectEntity:
          "The @identifiers decorator must be applied to a property that is an array of objects",
        armIdentifiersProperties:
          "The @identifiers decorator expects a parameter that is an array of strings or an empty array.",
      },
    },
    "arm-resource-circular-ancestry": {
      severity: "warning",
      messages: {
        default:
          "There is a loop in the ancestry of this resource.  Please ensure that the `@parentResource` decorator contains the correct parent resource, and that parentage contains no cycles.",
      },
    },
    "arm-resource-duplicate-base-parameter": {
      severity: "warning",
      messages: {
        default:
          "Only one base parameter type is allowed per resource.  Each resource may have only one of `@parentResource`, `@resourceGroupResource`, `@tenantResource`, `@locationResource`, or `@subscriptionResource` decorators.",
      },
    },
    "arm-resource-missing-name-property": {
      severity: "error",
      messages: {
        default: "Resource types must include a string property called 'name'.",
      },
    },
    "arm-resource-missing-name-key-decorator": {
      severity: "error",
      messages: {
        default:
          "Resource type 'name' property must have a @key decorator which defines its key name.",
      },
    },
    "arm-resource-missing-name-segment-decorator": {
      severity: "error",
      messages: {
        default:
          "Resource type 'name' property must have a @segment decorator which defines its path fragment.",
      },
    },
    "arm-resource-missing-arm-namespace": {
      severity: "error",
      messages: {
        default:
          "The @armProviderNamespace decorator must be used to define the ARM namespace of the service.  This is best applied to the file-level namespace.",
      },
    },
    "arm-resource-invalid-base-type": {
      severity: "error",
      messages: {
        default:
          "The @armResourceInternal decorator can only be used on a type that ultimately extends TrackedResource, ProxyResource, or ExtensionResource.",
      },
    },
    "arm-resource-missing": {
      severity: "error",
      messages: {
        default: paramMessage`No @armResource registration found for type ${"type"}`,
      },
    },
    "arm-common-types-incompatible-version": {
      severity: "warning",
      messages: {
        default: paramMessage`No ARM common-types version for this type satisfies the expected version ${"selectedVersion"}.  This type only supports the following version(s): ${"supportedVersions"}`,
      },
    },
    "arm-common-types-invalid-version": {
      severity: "error",
      messages: {
        default: paramMessage`No ARM common-types version matches the version string ${"versionString"}.  The following versions are supported: ${"supportedVersions"}`,
      },
    },
    "decorator-in-namespace": {
      severity: "error",
      messages: {
        default: paramMessage`The @${"decoratorName"} decorator can only be applied to an operation that is defined inside of a namespace.`,
      },
    },
    "parent-type": {
      severity: "error",
      messages: {
        notResourceType: paramMessage`Parent type ${"parent"} of ${"type"} is not registered as an ARM resource type.`,
      },
    },
    "resource-without-path-and-segment": {
      severity: "error",
      messages: {
        default: "Resource types must have a property with '@path` and '@segment' decorators.",
      },
    },
    "resource-without-provider-namespace": {
      severity: "warning",
      messages: {
        default: paramMessage`The resource "${"resourceName"}" does not have a provider namespace.  Please use a resource in a namespace marked with '@armProviderNamespace' or a virtual resource with a specific namespace`,
      },
    },
    "template-type-constraint-no-met": {
      severity: "error",
      messages: {
        default: paramMessage`The template parameter "${"sourceType"}" for "${"entity"}" does not extend the constraint type "${"constraintType"}". ${"actionMessage"}`,
      },
    },
  },
});

export const { reportDiagnostic, createDiagnostic } = $lib;
