import { createRule, Program } from "@typespec/compiler";
import { getArmResources, getResourceBaseType, ResourceBaseType } from "../resource.js";
import { getInterface } from "./utils.js";

/**
 * verify tenant and extension resources do not define list by subscription
 */
export const listBySubscriptionRule = createRule({
  name: "improper-subscription-list-operation",
  severity: "warning",
  description: `Tenant and Extension resources should not define a list by subscription operation.`,
  messages: {
    default: `Tenant and Extension resources should not define a list by subscription operation.`,
  },
  create(context) {
    return {
      root: (program: Program) => {
        const resources = getArmResources(program);
        for (const armResource of resources) {
          if (armResource && armResource.operations.lists) {
            const baseType = getResourceBaseType(context.program, armResource.typespecType);
            if (baseType === ResourceBaseType.Tenant) {
              for (const listOperationName of Object.keys(armResource.operations.lists)) {
                const listOperation = armResource.operations.lists[listOperationName];
                if (listOperation.path.includes("{subscriptionId}")) {
                  const resourceInterface = getInterface(armResource);
                  context.reportDiagnostic({
                    target: resourceInterface ?? armResource.typespecType,
                  });
                }
              }
            }
          }
        }
      },
    };
  },
});
