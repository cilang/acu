"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidateCommand = createValidateCommand;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const schema_1 = require("../core/schema");
const paths_1 = require("../core/paths");
const loader_1 = require("../core/loader");
const RED = "\x1b[91m";
const GREEN = "\x1b[92m";
const YELLOW = "\x1b[93m";
const RESET = "\x1b[0m";
function loadSchema(name, projectRoot) {
    const candidates = [path.join(projectRoot, "data", "schema", name), name];
    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            const schema = (0, loader_1.loadJson)(candidate);
            // Remove $schema to avoid AJV draft issues
            if (schema && typeof schema === "object") {
                delete schema.$schema;
            }
            return schema;
        }
    }
    console.error(`${RED}Error: schema not found: ${name}${RESET}`);
    process.exit(1);
}
function printResult(filepath, schemaErrs, invErrs, index, total, noColor) {
    let ns = "";
    try {
        const data = (0, loader_1.loadJson)(filepath);
        ns = data.namespace || data.name || "";
    }
    catch (error) {
        // Ignore
    }
    const passed = schemaErrs.length === 0 && invErrs.length === 0;
    const color = noColor ? "" : passed ? GREEN : RED;
    const status = passed ? "PASS" : "FAIL";
    console.log(`${color}${status}${RESET} [${index}/${total}] ${path.relative(process.cwd(), filepath)} ${ns ? `(${ns})` : ""}`);
    if (!passed) {
        for (const err of schemaErrs) {
            console.log(`  ${RED}Schema: ${err}${RESET}`);
        }
        for (const err of invErrs) {
            console.log(`  ${YELLOW}Invariant [${err.category}]: ${err.message}${RESET}`);
        }
    }
    return passed;
}
function createValidateCommand() {
    const command = new commander_1.Command("validate");
    command
        .description("validate Factor or Paradigm JSON files")
        .argument("<type>", 'Type to validate: "factor" or "paradigm"')
        .argument("<pattern>", "File pattern or path to validate")
        .option("--strict", "Treat warnings as errors")
        .option("--no-color", "Disable colored output")
        .action(async (type, pattern, options) => {
        const projectRoot = (0, paths_1.findProjectRoot)();
        const schema = loadSchema(`${type}.schema.json`, projectRoot);
        const files = await (0, loader_1.collectFactorFiles)(pattern, projectRoot);
        let passed = 0;
        let total = 0;
        for (const file of files) {
            total++;
            const data = (0, loader_1.loadJson)(file);
            let schemaErrs;
            let invErrs;
            if (type === "factor") {
                schemaErrs = (0, schema_1.validateFactorSchema)(data, schema);
                invErrs = (0, schema_1.checkFactorInvariants)(data, projectRoot);
            }
            else if (type === "paradigm") {
                schemaErrs = (0, schema_1.validateParadigmSchema)(data, schema);
                invErrs = (0, schema_1.checkParadigmInvariants)(data, projectRoot);
            }
            else {
                console.error(`${RED}Error: Invalid type '${type}'. Must be 'factor' or 'paradigm'${RESET}`);
                process.exit(1);
            }
            if (printResult(file, schemaErrs, invErrs, total, files.length, options.noColor)) {
                passed++;
            }
        }
        const overallPassed = passed === total;
        const exitCode = overallPassed ? 0 : 1;
        console.log(`\n${overallPassed ? GREEN : RED}Result: ${passed}/${total} files passed${RESET}`);
        process.exit(exitCode);
    });
    return command;
}
