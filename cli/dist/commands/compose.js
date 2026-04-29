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
exports.createComposeCommand = createComposeCommand;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const paths_1 = require("../core/paths");
const loader_1 = require("../core/loader");
const GREEN = '\x1b[92m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const RED = '\x1b[91m';
function inlineRefs(rootObj, depth = 0, stack = [], projectRoot) {
    if (rootObj === null || typeof rootObj !== 'object') {
        return rootObj;
    }
    if (Array.isArray(rootObj)) {
        return rootObj.map((item) => inlineRefs(item, depth + 1, stack, projectRoot));
    }
    if ('$missing' in rootObj || '$circular_ref' in rootObj) {
        return rootObj;
    }
    if ('$ref' in rootObj && Object.keys(rootObj).length === 1) {
        const refPath = rootObj.$ref;
        if (!(0, loader_1.looksLikeLocalPath)(refPath)) {
            return rootObj;
        }
        if (stack.includes(refPath)) {
            return { $circular_ref: refPath };
        }
        console.log(`${'  '.repeat(depth)}→ ${refPath}`);
        const loaded = (0, loader_1.loadJson)(refPath, projectRoot);
        if (loaded === null) {
            return { $missing: refPath };
        }
        return inlineRefs(loaded, depth, [...stack, refPath], projectRoot);
    }
    const result = {};
    for (const [k, v] of Object.entries(rootObj)) {
        result[k] = inlineRefs(v, depth + 1, stack, projectRoot);
    }
    return result;
}
function injectData(skeleton, projectRoot) {
    const collections = {
        factor_paradigms: (0, loader_1.discoverJsonFiles)(path.join(projectRoot, 'data', 'factor_paradigms'), 'data/factor_paradigms'),
        probability_matrix: (0, loader_1.discoverJsonFiles)(path.join(projectRoot, 'data', 'probability_matrix'), 'data/probability_matrix'),
    };
    const acu = (skeleton.acu = skeleton.acu || {});
    const dataSection = (acu.data = acu.data || {});
    for (const [collName, entries] of Object.entries(collections)) {
        if (Object.keys(entries).length > 0) {
            const existing = dataSection[collName] || {};
            Object.assign(existing, entries);
            dataSection[collName] = existing;
        }
    }
    return skeleton;
}
function createComposeCommand() {
    const command = new commander_1.Command('compose');
    command
        .description('compose the modular ACU spec into a single acu.json')
        .option('--skeleton <path>', 'Path to the skeleton JSON (default: acu.json)')
        .option('--output <path>', 'Path for composed output (default: dist/acu.json)')
        .option('--write', 'Write the composed output to file')
        .action(async (options) => {
        const projectRoot = (0, paths_1.findProjectRoot)();
        const defaultSkel = 'acu.json';
        const defaultOut = 'dist/acu.json';
        const skelPath = options.skeleton || path.join(projectRoot, defaultSkel);
        const outPath = options.output || path.join(projectRoot, defaultOut);
        if (!fs.existsSync(skelPath)) {
            console.error(`${RED}Error:${RESET} skeleton not found: ${skelPath}`);
            process.exit(1);
        }
        console.log(`${DIM}Loading skeleton:${RESET} ${path.relative(projectRoot, skelPath)}`);
        const skeleton = (0, loader_1.loadJson)(skelPath);
        const skeletonWithData = injectData(skeleton, projectRoot);
        const composed = inlineRefs(skeletonWithData, 0, [], projectRoot);
        if (options.write) {
            const outDir = path.dirname(outPath);
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }
            fs.writeFileSync(outPath, JSON.stringify(composed, null, 2) + '\n');
            const stats = fs.statSync(outPath);
            console.log(`\n${GREEN}✓${RESET} Wrote ${path.relative(projectRoot, outPath)} (${stats.size} bytes)`);
        }
        else {
            console.log(JSON.stringify(composed, null, 2));
            console.log(`\n${DIM}(Dry run — use --write to save)${RESET}`);
        }
    });
    return command;
}
