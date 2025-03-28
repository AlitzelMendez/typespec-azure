import {
  createRule,
  getDiscriminator,
  getTypeName,
  isTemplateInstance,
  paramMessage,
} from "@typespec/compiler";
import { SyntaxKind } from "@typespec/compiler/ast";

export const compositionOverInheritanceRule = createRule({
  name: "composition-over-inheritance",
  description:
    "Check that if a model is used in an operation and has derived models that it has a discriminator or recommend to use composition via spread or `is`.",
  severity: "warning",
  messages: {
    default: paramMessage`Model '${"name"}' is extending '${"baseModel"}' that doesn't define a discriminator. If '${"baseModel"}' is meant to be used:
 - For composition consider using spread \`...\` or \`model is\` instead.
 - As a polymorphic relation, add the \`@discriminator\` decorator on the base model.`,
    instance: paramMessage`Model '${"name"}' is extending a template '${"baseModel"}'. Consider using composition with spread \`...\` or \`model is\` instead.`,
  },
  create(context) {
    return {
      model: (model) => {
        if (
          model.baseModel &&
          model.node?.kind === SyntaxKind.ModelStatement &&
          model.node.extends &&
          getDiscriminator(context.program, model.baseModel) === undefined
        ) {
          context.reportDiagnostic({
            messageId: isTemplateInstance(model.baseModel) ? "instance" : "default",
            format: {
              name: model.name,
              baseModel: getTypeName(model.baseModel),
            },
            target: model.node.extends,
          });
        }
      },
    };
  },
});
