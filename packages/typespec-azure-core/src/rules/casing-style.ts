import {
  Interface,
  Model,
  ModelProperty,
  Namespace,
  Operation,
  createRule,
  isTemplateDeclarationOrInstance,
  paramMessage,
} from "@typespec/compiler";
import { isCamelCaseNoAcronyms, isPascalCaseWithAcceptedAcronyms } from "./utils.js";

const acceptedAzureAcronyms = ["AI", "VM", "OS", "IP", "CPU", "GPU", "LRO"];
export const casingRule = createRule({
  name: "casing-style",
  description: "Ensure proper casing style.",
  severity: "warning",
  url: "https://azure.github.io/typespec-azure/docs/libraries/azure-core/rules/casing-style",
  messages: {
    default: paramMessage`The names of ${"type"} types must use ${"casing"}`,
  },
  create(context) {
    return {
      model: (model: Model) => {
        if (!isPascalCaseWithAcceptedAcronyms(model.name, acceptedAzureAcronyms)) {
          context.reportDiagnostic({
            format: { type: "Model", casing: "PascalCase" },
            target: model,
          });
        }
      },
      modelProperty: (property: ModelProperty) => {
        if (property.name === "_") return;
        if (!isCamelCaseNoAcronyms(property.name)) {
          context.reportDiagnostic({
            format: { type: "Property", casing: "camelCase" },
            target: property,
          });
        }
      },
      operation: (operation: Operation) => {
        if (isTemplateDeclarationOrInstance(operation)) {
          if (!isPascalCaseWithAcceptedAcronyms(operation.name, acceptedAzureAcronyms)) {
            context.reportDiagnostic({
              format: { type: "Operation Template", casing: "PascalCase" },
              target: operation,
            });
          }
        } else if (!isCamelCaseNoAcronyms(operation.name)) {
          context.reportDiagnostic({
            format: { type: "Operation", casing: "camelCase" },
            target: operation,
          });
        }
      },
      interface: (operationGroup: Interface) => {
        if (!isPascalCaseWithAcceptedAcronyms(operationGroup.name, acceptedAzureAcronyms)) {
          context.reportDiagnostic({
            format: { type: "Interface", casing: "PascalCase" },
            target: operationGroup,
          });
        }
      },
      namespace: (namespace: Namespace) => {
        if (!isPascalCaseWithAcceptedAcronyms(namespace.name, acceptedAzureAcronyms)) {
          context.reportDiagnostic({
            format: { type: "Namespace", casing: "PascalCase" },
            target: namespace,
          });
        }
      },
    };
  },
});
