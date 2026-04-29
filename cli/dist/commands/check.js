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
exports.createCheckCommand = createCheckCommand;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const loader_1 = require("../core/loader");
const paths_1 = require("../core/paths");
const RED = "\x1b[91m";
const GREEN = "\x1b[92m";
const YELLOW = "\x1b[93m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
function loadJson(filepath) {
    try {
        const content = fs.readFileSync(filepath, "utf-8");
        return JSON.parse(content);
    }
    catch (error) {
        return null;
    }
}
function createCheckCommand() {
    const command = new commander_1.Command("check-namespaces");
    command
        .description("verify that Factor namespaces match their file paths")
        .argument("[targets...]", "file patterns or directories to check")
        .option("--no-color", "disable colored output")
        .action(async (targets, options) => {
        const noColor = options.color === false;
        const red = noColor ? "" : RED;
        const green = noColor ? "" : GREEN;
        const yellow = noColor ? "" : YELLOW;
        const dim = noColor ? "" : DIM;
        const bold = noColor ? "" : BOLD;
        const reset = noColor ? "" : RESET;
        const projectRoot = (0, paths_1.findProjectRoot)();
        const factorDir = (0, paths_1.resolveFactorDir)(projectRoot);
        if (targets.length === 0) {
            targets = [factorDir];
        }
        let allFiles = [];
        for (const target of targets) {
            const files = await (0, loader_1.collectFactorFiles)(target, projectRoot);
            allFiles.push(...files);
        }
        if (allFiles.length === 0) {
            console.error(`${red}Error: no JSON files found.${reset}`);
            process.exit(1);
        }
        console.log(`${dim}Checking namespaces for ${allFiles.length} files...${reset}`);
        let mismatches = 0;
        for (let i = 0; i < allFiles.length; i++) {
            const fp = allFiles[i];
            const data = loadJson(fp);
            if (!data) {
                console.log(`${red}✗${reset} ${fp}: Failed to load JSON`);
                mismatches++;
                continue;
            }
            const namespace = data.namespace;
            if (!namespace) {
                console.log(`${yellow}!${reset} ${fp}: No 'namespace' field found.`);
                continue;
            }
            // Calculate expected path relative to factor_dir
            // namespace "A/B/C" -> expected "A/B/C.json"
            const expectedRelPath = `${namespace}.json`;
            let actualRelPath;
            try {
                actualRelPath = path.relative(factorDir, fp);
            }
            catch (error) {
                // File is not under factor_dir, maybe it's an absolute path or outside project
                console.log(`${yellow}!${reset} ${fp}: File is outside the configured FACTOR_DIR (${factorDir})`);
                continue;
            }
            if (actualRelPath !== expectedRelPath) {
                console.log(`${red}✗${reset} ${bold}${fp}${reset}`);
                console.log(`  ${dim}Actual:${reset}   ${actualRelPath}`);
                console.log(`  ${dim}Expected:${reset} ${expectedRelPath} (from namespace: '${namespace}')`);
                mismatches++;
            }
            else {
                // Optional: verbose output for matches
                // console.log(`${green}✓${reset} ${fp}`);
            }
        }
        if (mismatches > 0) {
            console.log(`\n${red}Found ${mismatches} namespace mismatch(es).${reset}`);
            process.exit(1);
        }
        else {
            console.log(`\n${green}All namespaces match their file paths!${reset}`);
        }
    });
    return command;
}
