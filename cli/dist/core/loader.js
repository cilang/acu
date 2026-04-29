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
exports.loadJson = loadJson;
exports.looksLikeLocalPath = looksLikeLocalPath;
exports.discoverJsonFiles = discoverJsonFiles;
exports.collectFactorFiles = collectFactorFiles;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
const cache = new Map();
function loadJson(refPath, projectRoot) {
    if (cache.has(refPath)) {
        return cache.get(refPath);
    }
    const fullPath = projectRoot ? path.resolve(projectRoot, refPath) : refPath;
    if (!fs.existsSync(fullPath)) {
        cache.set(refPath, null);
        return null;
    }
    try {
        const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
        cache.set(refPath, data);
        return data;
    }
    catch (error) {
        cache.set(refPath, null);
        return null;
    }
}
function looksLikeLocalPath(value) {
    return (typeof value === "string" &&
        value.endsWith(".json") &&
        value.includes("/") &&
        !value.startsWith("http://") &&
        !value.startsWith("https://") &&
        !path.isAbsolute(value));
}
function discoverJsonFiles(srcDir, baseRef) {
    if (!fs.existsSync(srcDir)) {
        return {};
    }
    const entries = {};
    const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".json"));
    for (const file of files.sort()) {
        const stem = path.parse(file).name;
        entries[stem] = { $ref: `${baseRef}/${file}` };
    }
    return entries;
}
async function collectFactorFiles(pattern, projectRoot) {
    const files = await (0, glob_1.glob)(pattern, { cwd: projectRoot });
    return files.filter((f) => f.endsWith(".json")).map((f) => path.resolve(projectRoot, f));
}
