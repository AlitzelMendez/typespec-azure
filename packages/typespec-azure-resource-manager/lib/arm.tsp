import "../dist/src/tsp-index.js";
import "@typespec/openapi";
import "@typespec/http";
import "@typespec/rest";
import "@typespec/versioning";
import "@azure-tools/typespec-azure-core";

import "./foundations/arm.foundations.tsp";
import "./Legacy/arm.legacy.tsp";
import "./common-types/common-types.tsp";
import "./extension/extension.tsp";
import "./backcompat.tsp";
import "./private.decorators.tsp";
import "./models.tsp";
import "./operations.tsp";
import "./decorators.tsp";
import "./interfaces.tsp";
import "./responses.tsp";
import "./parameters.tsp";

using Http;
using Rest;
using Versioning;
using OpenAPI;
using Azure.ResourceManager.Foundations;

@versioned(Azure.ResourceManager.Versions)
namespace Azure.ResourceManager;

/**
 * Supported versions of Azure.ResourceManager building blocks.
 *
 * @example
 * ```typespec
 * enum Versions {
 *  @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
 *  @useDependency(Azure.Core.Versions.v1_0_Preview_2)
 *  @armCommonTypesVersion(Azure.ResourceManager.CommonTypes.Versions.v5)
 *  v2021_10_01_preview: "2021-10-01-preview",
 *
 *  @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
 *  @useDependency(Azure.Core.Versions.v1_0_Preview_2)
 *  @armCommonTypesVersion(Azure.ResourceManager.CommonTypes.Versions.v5)
 *  v2021_11_01: "2021-11-01",
 * }
 * ```
 */
@doc("Supported versions of Azure.ResourceManager building blocks.")
enum Versions {
  @doc("Version 1.0-preview.1")
  @useDependency(Azure.Core.Versions.v1_0_Preview_2)
  v1_0_Preview_1: "1.0-preview.1",
}
