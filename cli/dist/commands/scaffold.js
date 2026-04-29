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
exports.createScaffoldCommand = createScaffoldCommand;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const loader_1 = require("../core/loader");
const paths_1 = require("../core/paths");
const RED = "\x1b[91m";
const GREEN = "\x1b[92m";
const YELLOW = "\x1b[93m";
const CYAN = "\x1b[96m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
const NODES = "xyz0123456789abcdef".split("");
const DEFAULT_RESONANCE = { n: 2, m: 2, chirality: "right" };
const DEFAULT_QUANTIZATION = { base: 19, formula: "19^n × 2^m" };
const DEFAULT_USEPONG = { stratum: "global" };
const DEFAULT_VIEW_MODE = { default_mode: "knot" };
function loadParadigm(paradigmName, projectRoot) {
    const paradigmDir = (0, paths_1.resolveParadigmDir)(projectRoot);
    const paradigmPath = path.join(paradigmDir, `${paradigmName}.json`);
    if (!fs.existsSync(paradigmPath)) {
        console.error(`${RED}Error: paradigm '${paradigmName}' not found at ${paradigmPath}${RESET}`);
        process.exit(1);
    }
    return (0, loader_1.loadJson)(paradigmPath, projectRoot);
}
function listParadigms(projectRoot) {
    const paradigmDir = (0, paths_1.resolveParadigmDir)(projectRoot);
    if (!fs.existsSync(paradigmDir)) {
        return [];
    }
    return fs
        .readdirSync(paradigmDir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => path.parse(f).name)
        .sort();
}
function findNamespaceTemplate(parentParadigmDef, childParadigm) {
    const mappings = parentParadigmDef?.mappings?.cilang || {};
    for (const node of Object.keys(mappings)) {
        const mapping = mappings[node];
        const subConstraint = mapping?.sub_factor_constraint || {};
        const allowed = subConstraint.allowed_paradigms || [];
        if (allowed.includes(childParadigm)) {
            const templates = mapping.namespace_template;
            if (templates) {
                if (Array.isArray(templates)) {
                    return templates[0];
                }
                return templates;
            }
        }
    }
    return null;
}
async function promptForField(fieldName, defaultValue = "", required = false) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    let promptText = `${CYAN}${fieldName}${RESET}`;
    if (defaultValue) {
        promptText += ` [${defaultValue}]`;
    }
    if (required) {
        promptText += ` ${YELLOW}(required)${RESET}`;
    }
    return new Promise((resolve) => {
        const ask = () => {
            rl.question(`  ${promptText}: `, (answer) => {
                const value = answer.trim() || defaultValue;
                if (value || !required) {
                    rl.close();
                    resolve(value);
                }
                else {
                    console.log(`    ${YELLOW}This field is required.${RESET}`);
                    ask();
                }
            });
        };
        ask();
    });
}
function buildBlankCilang() {
    const cilang = {};
    for (const node of NODES) {
        cilang[node] = {
            label: `Node${node.toUpperCase()}`,
            definition: "",
            role: "",
            manifestation: "",
            value: 0,
            phase_offset: 0,
        };
    }
    return cilang;
}
function buildTypedCilang(paradigmDef) {
    const cilang = {};
    const mappings = paradigmDef?.mappings?.cilang || {};
    for (const node of NODES) {
        const mapping = mappings[node] || {};
        const interpretation = mapping.interpretation || "";
        const defaultLabel = mapping.label || "";
        const label = defaultLabel || `Node${node.toUpperCase()}`;
        cilang[node] = {
            label,
            definition: "",
            role: "",
            manifestation: "",
            value: 0,
            phase_offset: 0,
        };
        if (interpretation) {
            cilang[node].__guidance__ = interpretation;
        }
    }
    return cilang;
}
function computeNamespace(paradigm, name, parent, projectRoot) {
    if (parent) {
        // Try to find parent file
        let parentPath = path.join(projectRoot, "factor", parent.replace(/\//g, path.sep) + ".json");
        if (!fs.existsSync(parentPath)) {
            // Try with namespace segments
            const lastSegment = parent.split("/").pop();
            parentPath = path.join(projectRoot, "factor", parent.replace(/\//g, path.sep), `${lastSegment}.json`);
        }
        if (fs.existsSync(parentPath)) {
            const parentData = (0, loader_1.loadJson)(parentPath, projectRoot);
            const parentParadigm = parentData?.type_binding?.paradigm;
            if (parentParadigm) {
                try {
                    const parentParadigmDef = loadParadigm(parentParadigm, projectRoot);
                    const template = findNamespaceTemplate(parentParadigmDef, paradigm || "any");
                    if (template) {
                        return template
                            .replace("{parent}", parent)
                            .replace("{label}", name)
                            .replace("{paradigm}", paradigm || "");
                    }
                }
                catch (error) {
                    // Fall through to default
                }
            }
        }
        // Fallback: append name to parent namespace
        return `${parent}/${name}`;
    }
    // Root level
    return name;
}
function computeFilePath(namespace, output, projectRoot) {
    if (output) {
        return path.isAbsolute(output) ? output : path.join(projectRoot, output);
    }
    const factorDir = (0, paths_1.resolveFactorDir)(projectRoot);
    const relPath = namespace.replace(/\//g, path.sep) + ".json";
    return path.join(factorDir, relPath);
}
function buildFactor(paradigm, name, namespace, parent, imports, paradigmDef, projectRoot) {
    const factorImports = [];
    if (parent) {
        factorImports.push({ namespace: parent });
    }
    for (const imp of imports) {
        if (imp !== parent) {
            factorImports.push({ namespace: imp });
        }
    }
    let cilang;
    let resonance;
    let usepong;
    if (paradigmDef) {
        cilang = buildTypedCilang(paradigmDef);
        resonance = paradigmDef.resonance_default || DEFAULT_RESONANCE;
        const defaultStratum = paradigmDef.composition_guidance?.creating_anew?.default_stratum || "global";
        usepong = { stratum: defaultStratum };
    }
    else {
        cilang = buildBlankCilang();
        resonance = DEFAULT_RESONANCE;
        usepong = DEFAULT_USEPONG;
    }
    return {
        namespace,
        imports: factorImports,
        version: "1.0.0",
        status: "partial",
        label: name,
        definition: "",
        role: "",
        manifestation: "",
        cilang,
        type_binding: {
            paradigm: paradigm || "generic",
            resonance,
            quantization: DEFAULT_QUANTIZATION,
            usepong_binding: usepong,
            view_mode: DEFAULT_VIEW_MODE,
        },
    };
}
function createScaffoldCommand() {
    const command = new commander_1.Command("scaffold");
    const factorCmd = new commander_1.Command("factor")
        .description("scaffold a new Factor JSON from a paradigm or blank template")
        .option("-p, --paradigm <paradigm>", "Paradigm name (from data/factor_paradigms/)")
        .option("-n, --name <name>", "Factor name (will be part of namespace)")
        .option("-o, --output <path>", "Output file path (default: computed from namespace)")
        .option("--parent <namespace>", "Parent namespace (for nested Factors)")
        .option("--imports <imports>", "Additional namespace(s) to import, comma-separated")
        .option("--dry-run", "Print generated JSON without writing")
        .option("--interactive", "Interactive mode")
        .action(async (options) => {
        const projectRoot = (0, paths_1.findProjectRoot)();
        let paradigm = options.paradigm;
        let name = options.name;
        const output = options.output;
        const parent = options.parent;
        const imports = options.imports ? options.imports.split(",").map((i) => i.trim()) : [];
        const dryRun = options.dryRun;
        const interactive = options.interactive;
        // Interactive mode
        if (interactive || !name) {
            console.log(`${BOLD}ACU Factor Scaffolder${RESET}`);
            console.log(`${DIM}Press Enter to accept default values.${RESET}`);
            console.log();
            if (!paradigm) {
                const paradigms = listParadigms(projectRoot);
                if (paradigms.length > 0) {
                    console.log(`${CYAN}Available paradigms:${RESET}`);
                    paradigms.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
                    console.log();
                }
                paradigm = await promptForField("Paradigm (blank for generic)", paradigm);
            }
            if (!name) {
                name = await promptForField("Factor name", name, true);
            }
            if (!parent && (interactive || paradigm)) {
                const parentInput = await promptForField("Parent namespace (optional)", parent);
                if (parentInput) {
                    options.parent = parentInput;
                }
            }
        }
        if (!name) {
            console.error(`${RED}Error: Factor name is required.${RESET}`);
            process.exit(1);
        }
        let paradigmDef = undefined;
        if (paradigm) {
            paradigmDef = loadParadigm(paradigm, projectRoot);
        }
        const namespace = computeNamespace(paradigm, name, parent, projectRoot);
        const filePath = computeFilePath(namespace, output, projectRoot);
        const factor = buildFactor(paradigm, name, namespace, parent, imports, paradigmDef, projectRoot);
        if (dryRun) {
            console.log(JSON.stringify(factor, null, 2));
            console.log();
            console.log(`${DIM}Would write to: ${filePath}${RESET}`);
        }
        else {
            // Ensure directory exists
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(filePath, JSON.stringify(factor, null, 2));
            console.log(`${GREEN}✓${RESET} Created Factor ${namespace} at ${path.relative(projectRoot, filePath)}`);
        }
    });
    const paradigmCmd = new commander_1.Command("paradigm")
        .description("scaffold a new Paradigm JSON file")
        .option("-n, --name <name>", "Paradigm name")
        .option("-o, --output <path>", "Output file path")
        .option("--dry-run", "Print generated JSON without writing")
        .action((options) => {
        const projectRoot = (0, paths_1.findProjectRoot)();
        const name = options.name;
        const output = options.output || path.join((0, paths_1.resolveParadigmDir)(projectRoot), `${name || "new_paradigm"}.json`);
        const dryRun = options.dryRun;
        const paradigm = {
            name: name || "new_paradigm",
            version: "1.0.0",
            label: name || "New Paradigm",
            definition: "",
            role: "",
            manifestation: "",
            resonance_default: DEFAULT_RESONANCE,
            composition_guidance: {
                creating_anew: {
                    default_stratum: "global",
                },
            },
            mappings: {
                cilang: {},
            },
        };
        if (dryRun) {
            console.log(JSON.stringify(paradigm, null, 2));
            console.log();
            console.log(`${DIM}Would write to: ${output}${RESET}`);
        }
        else {
            const dir = path.dirname(output);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(output, JSON.stringify(paradigm, null, 2));
            console.log(`${GREEN}✓${RESET} Created Paradigm at ${path.relative(projectRoot, output)}`);
        }
    });
    const listCmd = new commander_1.Command("list-paradigms")
        .description("list all available paradigms for scaffolding")
        .action(() => {
        const projectRoot = (0, paths_1.findProjectRoot)();
        const paradigms = listParadigms(projectRoot);
        if (paradigms.length === 0) {
            console.log(`${YELLOW}No paradigms found in ${(0, paths_1.resolveParadigmDir)(projectRoot)}${RESET}`);
            return;
        }
        console.log(`${BOLD}Available paradigms:${RESET}`);
        paradigms.forEach((p) => console.log(`  ${p}`));
    });
    command.addCommand(factorCmd);
    command.addCommand(paradigmCmd);
    command.addCommand(listCmd);
    return command;
}
