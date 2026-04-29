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
exports.createInitCommand = createInitCommand;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("../core/config");
const RED = "\x1b[91m";
const GREEN = "\x1b[92m";
const YELLOW = "\x1b[93m";
const CYAN = "\x1b[96m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
function generateEnvFile(acuRootPath, customPaths) {
    const defaults = (0, config_1.getDefaultPaths)();
    const lines = [
        "# ACU Project Configuration",
        "# Paths are relative to this file's location (project root)",
        "# Use absolute paths if needed",
        "",
        "# ACU Framework Root (empty = auto-detect from installation)",
        `ACU_ROOT=${acuRootPath || ""}`,
        "",
        "# Project Directories",
        `FACTOR_DIR=${defaults.FACTOR_DIR}`,
        `SCHEMA_DIR=${defaults.SCHEMA_DIR}`,
        `PARADIGM_DIR=${defaults.PARADIGM_DIR}`,
        `PROTOCOL_DIR=${defaults.PROTOCOL_DIR}`,
        `PROSE_DIR=${defaults.PROSE_DIR}`,
        `DATA_DIR=${defaults.DATA_DIR}`,
    ];
    if (customPaths) {
        lines.push("");
        lines.push("# Custom Paths (override defaults above)");
        for (const [key, value] of Object.entries(customPaths)) {
            lines.push(`${key}=${value}`);
        }
    }
    lines.push("");
    return lines.join("\n");
}
function generateSampleFactor() {
    const nodes = "xyz0123456789abcdef".split("");
    const cilang = {};
    for (const node of nodes) {
        cilang[node] = {
            label: `Node${node.toUpperCase()}`,
            definition: "",
            role: "",
            manifestation: "",
            value: 0,
            phase_offset: 0,
        };
    }
    return {
        namespace: "HelloWorld",
        imports: [],
        version: "1.0.0",
        status: "partial",
        label: "HelloWorld",
        definition: "A minimal sample Factor created by acu init.",
        role: "To demonstrate the Factor structure and validate the project setup.",
        manifestation: "This Factor serves as a template and test artifact.",
        cilang,
        type_binding: {
            resonance: { n: 1, m: 1, chirality: "right" },
            quantization: { base: 19, formula: "19^n × 2^m" },
            usepong_binding: { stratum: "global" },
            view_mode: { default_mode: "knot" },
        },
    };
}
function createDirectoryStructure(projectRoot, dirs) {
    const created = [];
    for (const dirPath of dirs) {
        const fullPath = path.join(projectRoot, dirPath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            created.push(fullPath);
        }
    }
    return created;
}
function createGitignore(projectRoot) {
    const gitignorePath = path.join(projectRoot, ".gitignore");
    if (fs.existsSync(gitignorePath)) {
        return gitignorePath;
    }
    const content = `# ACU Project Gitignore

# Temporary and scratch files
tmp/
tools/
*.tmp

# TypeScript
dist/
node_modules/
*.tsbuildinfo

# Environment (contains local paths)
# .env

# OS
.DS_Store
Thumbs.db
`;
    fs.writeFileSync(gitignorePath, content);
    return gitignorePath;
}
function createInitCommand() {
    const command = new commander_1.Command("init");
    command
        .description("initialize a new ACU project with directory structure and .env configuration")
        .argument("[path]", "Project directory", ".")
        .option("--force", "Overwrite existing .env and directories")
        .option("--no-sample", "Skip creating the sample HelloWorld Factor")
        .option("--no-color", "Disable colored output")
        .action((targetPath, options) => {
        const noColor = options.color === false;
        const red = noColor ? "" : RED;
        const green = noColor ? "" : GREEN;
        const yellow = noColor ? "" : YELLOW;
        const cyan = noColor ? "" : CYAN;
        const dim = noColor ? "" : DIM;
        const bold = noColor ? "" : BOLD;
        const reset = noColor ? "" : RESET;
        const projectRoot = path.resolve(targetPath);
        const envFile = path.join(projectRoot, ".env");
        // Check if already initialized
        if (fs.existsSync(envFile) && !options.force) {
            console.log(`${yellow}Warning:${reset} Project already initialized at ${projectRoot}`);
            console.log(`  Use ${bold}--force${reset} to reinitialize and overwrite .env`);
            process.exit(0);
        }
        console.log(`\n${bold}Initializing ACU Project${reset}`);
        console.log(`${dim}Location:${reset} ${projectRoot}\n`);
        // Determine ACU root path (search from cwd first, then project_root)
        let acuRoot = "";
        const cwd = process.cwd();
        const possiblePaths = [
            path.join(cwd, "node_modules", "acu"),
            path.join(cwd, "..", "..", "node_modules", "acu"),
            path.join(projectRoot, "node_modules", "acu"),
        ];
        for (const possible of possiblePaths) {
            if (fs.existsSync(possible)) {
                acuRoot = possible;
                break;
            }
        }
        // Create directory structure
        const defaults = (0, config_1.getDefaultPaths)();
        const dirsToCreate = [
            defaults.FACTOR_DIR,
            defaults.SCHEMA_DIR,
            defaults.PARADIGM_DIR,
            defaults.PROTOCOL_DIR,
            defaults.PROSE_DIR,
            defaults.DATA_DIR,
        ];
        console.log(`${bold}Creating Directories${reset}`);
        const createdDirs = createDirectoryStructure(projectRoot, dirsToCreate);
        for (const dir of createdDirs) {
            const relPath = path.relative(projectRoot, dir);
            console.log(`  ${green}✓${reset} ${relPath}`);
        }
        // Create .gitignore
        console.log(`\n${bold}Creating .gitignore${reset}`);
        createGitignore(projectRoot);
        console.log(`  ${green}✓${reset} .gitignore`);
        // Create .env
        console.log(`\n${bold}Creating .env${reset}`);
        const envContent = generateEnvFile(acuRoot);
        fs.writeFileSync(envFile, envContent);
        console.log(`  ${green}✓${reset} .env`);
        // Create sample Factor
        if (!options.sample) {
            const sampleFactor = generateSampleFactor();
            const factorDir = path.join(projectRoot, defaults.FACTOR_DIR);
            const factorPath = path.join(factorDir, "HelloWorld.json");
            fs.writeFileSync(factorPath, JSON.stringify(sampleFactor, null, 2));
            console.log(`  ${green}✓${reset} factor/HelloWorld.json (sample Factor)`);
        }
        console.log(`\n${green}✓${reset} Project initialized successfully!`);
        console.log(`${dim}Next steps:${reset}`);
        console.log(`  1. Edit .env to configure paths if needed`);
        console.log(`  2. Add your Factor JSON files to ${defaults.FACTOR_DIR}/`);
        console.log(`  3. Run ${bold}acu validate factor "factor/**/*.json"${reset} to check your files`);
    });
    return command;
}
