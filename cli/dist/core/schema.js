"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFactorSchema = validateFactorSchema;
exports.validateParadigmSchema = validateParadigmSchema;
exports.checkFactorInvariants = checkFactorInvariants;
exports.checkParadigmInvariants = checkParadigmInvariants;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const ajv = new ajv_1.default({
    allErrors: true,
    strict: false, // Allow additional properties
    schemaId: "id", // Support $id in draft-2020-12
});
// Add common formats
(0, ajv_formats_1.default)(ajv);
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
function validateFactorSchema(data, schema) {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (valid)
        return [];
    return (validate.errors?.map((err) => {
        const instancePath = err.instancePath || "(root)";
        return `${instancePath}: ${err.message}`;
    }) || []);
}
function validateParadigmSchema(data, schema) {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (valid)
        return [];
    return (validate.errors?.map((err) => {
        const instancePath = err.instancePath || "(root)";
        return `${instancePath}: ${err.message}`;
    }) || []);
}
function checkFactorInvariants(data, projectRoot) {
    const errors = [];
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
function checkParadigmInvariants(data, projectRoot) {
    const errors = [];
    // Add paradigm-specific checks here
    return errors;
}
