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
exports.createJsonMinifyCommand = createJsonMinifyCommand;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const RED = "\x1b[91m";
const GREEN = "\x1b[92m";
const YELLOW = "\x1b[93m";
const RESET = "\x1b[0m";
function createJsonMinifyCommand() {
    const command = new commander_1.Command("json-minify");
    command
        .description("minify JSON files by stripping whitespace")
        .argument("[files...]", "JSON files to minify")
        .option("--output <path>", "Output path (only valid with a single input file)")
        .option("--stdin", "Read JSON from stdin, write minified to stdout")
        .action((files, options) => {
        if (options.stdin) {
            let input = "";
            const stdinBuffer = fs.readFileSync(0, "utf-8");
            try {
                const data = JSON.parse(stdinBuffer);
                process.stdout.write(JSON.stringify(data, null, 0).replace(/\s+/g, ""));
            }
            catch (error) {
                console.error(`${RED}Error:${RESET} invalid JSON: ${error.message}`);
                process.exit(1);
            }
            return;
        }
        if (files.length === 0 && !options.stdin) {
            console.error(`${RED}Error:${RESET} provide at least one file, or use --stdin`);
            process.exit(1);
        }
        if (options.output && files.length > 1) {
            console.error(`${RED}Error:${RESET} --output only works with a single input file`);
            process.exit(1);
        }
        for (const filePath of files) {
            const fp = path.resolve(filePath);
            try {
                const data = JSON.parse(fs.readFileSync(fp, "utf-8"));
                const target = options.output ? path.resolve(options.output) : fp;
                const targetDir = path.dirname(target);
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }
                const minifiedContent = JSON.stringify(data, null, 0).replace(/\s+/g, "");
                fs.writeFileSync(target, minifiedContent);
                const originalSize = fs.statSync(fp).size;
                const newSize = fs.statSync(target).size;
                const reduction = originalSize > 0 ? ((1 - newSize / originalSize) * 100).toFixed(0) : 0;
                console.log(`  ${GREEN}✓${RESET} ${path.basename(fp)}: ${originalSize} → ${newSize} bytes (${reduction}% smaller)`);
            }
            catch (error) {
                console.log(`  ${YELLOW}⚠${RESET} skipped: ${path.basename(fp)} (${error.message})`);
                continue;
            }
        }
    });
    return command;
}
