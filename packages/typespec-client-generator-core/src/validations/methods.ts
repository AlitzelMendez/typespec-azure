import { TCGCContext } from "../interfaces.js";
import { clientLocationKey, hasExplicitClientOrOperationGroup } from "../internal-utils.js";
import { reportDiagnostic } from "../lib.js";

export function validateMethods(context: TCGCContext) {
  validateNoClientLocationWithClientOrOperationGroup(context);
}

function validateNoClientLocationWithClientOrOperationGroup(context: TCGCContext) {
  if (context.program.stateMap(clientLocationKey) && hasExplicitClientOrOperationGroup(context)) {
    for (const [op, _] of context.program.stateMap(clientLocationKey)) {
      reportDiagnostic(context.program, {
        code: "client-location-conflict",
        target: op,
      });
    }
  }
}
