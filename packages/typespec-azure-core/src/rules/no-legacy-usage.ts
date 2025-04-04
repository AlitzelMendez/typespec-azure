import {
  createRule,
  DecoratedType,
  DiagnosticTarget,
  paramMessage,
  Type,
} from "@typespec/compiler";
import {
  checkDecoratorsInDisallowedNamespace,
  checkReferenceInDisallowedNamespace,
} from "./utils.js";

export const noLegacyUsage = createRule({
  name: "no-legacy-usage",
  description: "Linter warning against using elements from the Legacy namespace",
  severity: "warning",
  url: "https://azure.github.io/typespec-azure/docs/libraries/azure-core/rules/no-legacy-usage",
  messages: {
    default: paramMessage`Referencing elements inside Legacy namespace "${"ns"}" is not allowed.`,
  },
  create(context) {
    function checkDecorators(type: Type & DecoratedType) {
      return checkDecoratorsInDisallowedNamespace(context, type, "Legacy");
    }
    function checkReference(origin: Type, type: Type, target: DiagnosticTarget) {
      return checkReferenceInDisallowedNamespace(context, origin, type, target, "Legacy");
    }
    return {
      model: (model) => {
        checkDecorators(model);
        model.baseModel && checkReference(model, model.baseModel, model);
      },
      modelProperty: (prop) => {
        checkDecorators(prop);
        checkReference(prop, prop.type, prop);
      },
      unionVariant: (variant) => {
        checkDecorators(variant);
        checkReference(variant, variant.type, variant);
      },
      operation: (type) => {
        checkDecorators(type);
      },
      interface: (type) => {
        checkDecorators(type);
      },
      enum: (type) => {
        checkDecorators(type);
      },
      union: (type) => {
        checkDecorators(type);
      },
    };
  },
});
