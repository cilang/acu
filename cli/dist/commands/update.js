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
exports.createUpdateCommand = createUpdateCommand;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const RED = "\x1b[91m";
const YELLOW = "\x1b[93m";
const RESET = "\x1b[0m";
function createUpdateCommand() {
    const updateCmd = new commander_1.Command("update");
    const cilangCmd = new commander_1.Command("cilang")
        .description("update the label of cilang vertices x, y, z")
        .argument("<factor>", "Factor JSON file path")
        .option("--x <label>", "New label for cilang vertex x")
        .option("--y <label>", "New label for cilang vertex y")
        .option("--z <label>", "New label for cilang vertex z")
        .option("--no-backup", "Skip creating a .bak backup")
        .action((factor, options) => {
        const factorPath = path.resolve(factor);
        if (!fs.existsSync(factorPath)) {
            console.error(`${RED}Error: file not found: ${factorPath}${RESET}`);
            process.exit(1);
        }
        const data = JSON.parse(fs.readFileSync(factorPath, "utf-8"));
        const cilang = data.cilang || data.nodes;
        if (!cilang) {
            console.error(`${RED}Error: no 'cilang' or 'nodes' field in ${factorPath}${RESET}`);
            process.exit(1);
        }
        const updates = {
            x: options.x,
            y: options.y,
            z: options.z,
        };
        const applied = {};
        for (const [vid, newLabel] of Object.entries(updates)) {
            if (!newLabel)
                continue;
            const vertex = cilang[vid];
            if (!vertex) {
                console.log(`${YELLOW}Warning: cilang vertex '${vid}' not found, skipping.${RESET}`);
                continue;
            }
            const oldLabel = vertex.label || "(empty)";
            vertex.label = newLabel;
            applied[vid] = { old: oldLabel, new: newLabel };
        }
        if (Object.keys(applied).length === 0) {
            console.log("No labels specified. Use --x, --y, and/or --z.");
            return;
        }
        if (!options.backup) {
            const backupPath = factorPath + ".bak";
            fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        }
        fs.writeFileSync(factorPath, JSON.stringify(data, null, 2));
        const ns = data.namespace || path.parse(factorPath).name;
        console.log(`${ns}:`);
        for (const [vid, change] of Object.entries(applied)) {
            console.log(`  ${vid}: ${change.old} → ${change.new}`);
        }
        if (!options.backup) {
            console.log(`  Backup: ${factorPath}.bak`);
        }
    });
    updateCmd.addCommand(cilangCmd);
    return updateCmd;
}
