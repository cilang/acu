import Ajv from "ajv";
import * as path from "path";
import addFormats from "ajv-formats";

const ajv = new Ajv({
  allErrors: true,
  strict: false, // Allow additional properties
  schemaId: "id", // Support $id in draft-2020-12
});

// Add common formats
addFormats(ajv);

const REQUIRED_NODE_IDS = new Set("xyz0123456789abcdef");
const VALID_STRATA = new Set([
  "trefoil",
  "trefoil_a",
  "trefoil_b",
  "trefoil_c",
  "trefoil_d",
  "trefoil_f",
  "trefoil_g",
  "trefoil_h",
  "trefoil_i",
  "fig8",
  "global",
]);

export interface CheckResult {
  category: string;
  message: string;
}

export function validateFactorSchema(data: any, schema: any): string[] {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) return [];

  return (
    validate.errors?.map((err) => {
      const instancePath = err.instancePath || "(root)";
      return `${instancePath}: ${err.message}`;
    }) || []
  );
}

export function validateParadigmSchema(data: any, schema: any): string[] {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) return [];

  return (
    validate.errors?.map((err) => {
      const instancePath = err.instancePath || "(root)";
      return `${instancePath}: ${err.message}`;
    }) || []
  );
}

export function checkFactorInvariants(data: any, projectRoot: string): CheckResult[] {
  const errors: CheckResult[] = [];

  const cilang = data.cilang || {};
  const nodeIds = new Set(Object.keys(cilang));

  const missing = [...REQUIRED_NODE_IDS].filter((id) => !nodeIds.has(id));
  const extra = [...nodeIds].filter((id) => !REQUIRED_NODE_IDS.has(id));

  if (missing.length > 0) {
    errors.push({
      category: "cilang",
      message: `Missing required node IDs: ${missing.join(", ")}`,
    });
  }

  if (extra.length > 0) {
    errors.push({
      category: "cilang",
      message: `Extra node IDs: ${extra.join(", ")}`,
    });
  }

  // Check strata
  const strata = data.strata;
  if (strata && !VALID_STRATA.has(strata)) {
    errors.push({
      category: "strata",
      message: `Invalid strata '${strata}'. Must be one of: ${[...VALID_STRATA].join(", ")}`,
    });
  }

  return errors;
}

export function checkParadigmInvariants(data: any, projectRoot: string): CheckResult[] {
  const errors: CheckResult[] = [];

  // Add paradigm-specific checks here

  return errors;
}
