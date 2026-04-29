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
exports.createUpdateVersionCommand = createUpdateVersionCommand;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const paths_1 = require("../core/paths");
const RED = "\x1b[91m";
const YELLOW = "\x1b[93m";
const RESET = "\x1b[0m";
function isValidVersion(version) {
    const pattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
    return pattern.test(version);
}
function createUpdateVersionCommand() {
    const command = new commander_1.Command("update-version");
    command
        .description("batch update the version field in all Factor JSON files")
        .argument("<new_version>", "New version in x.y.z format")
        .option("--no-backup", "Skip creating .bak backups")
        .action((newVersion, options) => {
        if (!isValidVersion(newVersion)) {
            console.error(`${RED}Error: Invalid version format: '${newVersion}' (expected x.y.z)${RESET}`);
            process.exit(1);
        }
        const projectRoot = (0, paths_1.findProjectRoot)();
        const factorDir = (0, paths_1.resolveFactorDir)(projectRoot);
        if (!fs.existsSync(factorDir)) {
            console.error(`${RED}Error: Factor directory not found: ${factorDir}${RESET}`);
            process.exit(1);
        }
        let updatedCount = 0;
        let skippedCount = 0;
        // Find all .json files recursively under factor_dir
        function walk(dir) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    walk(fullPath);
                }
                else if (entry.isFile() && entry.name.endsWith(".json")) {
                    try {
                        const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
                        // Check if it's a Factor file (has 'version' field)
                        if (data.version === undefined) {
                            skippedCount++;
                            continue;
                        }
                        const oldVersion = data.version;
                        if (oldVersion === newVersion) {
                            // Already at the target version
                            continue;
                        }
                        // Update version
                        data.version = newVersion;
                        // Create backup if requested
                        if (options.backup !== false) {
                            const backupPath = fullPath + ".bak";
                            try {
                                fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
                            }
                            catch (error) {
                                console.log(`${YELLOW}Warning: Failed to create backup for ${fullPath}: ${error.message}${RESET}`);
                            }
                        }
                        // Save updated file
                        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
                        console.log(`Updated ${path.relative(projectRoot, fullPath)}: ${oldVersion} → ${newVersion}`);
                        updatedCount++;
                    }
                    catch (error) {
                        if (error.code === "ENOENT") {
                            continue;
                        }
                        console.log(`${YELLOW}Warning: Skipping ${fullPath}: ${error.message}${RESET}`);
                        skippedCount++;
                    }
                }
            }
        }
        walk(factorDir);
        console.log(`\nSummary: ${updatedCount} files updated, ${skippedCount} files skipped.`);
    });
    return command;
}
