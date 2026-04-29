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
exports.findProjectRoot = findProjectRoot;
exports.resolveFactorDir = resolveFactorDir;
exports.resolveParadigmDir = resolveParadigmDir;
exports.resolveSchemaDir = resolveSchemaDir;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const config_1 = require("./config");
function findProjectRoot(start) {
    if (!start) {
        start = process.cwd();
    }
    let current = start;
    while (true) {
        if (fs.existsSync(path.join(current, ".env")) ||
            fs.existsSync(path.join(current, "acu")) ||
            fs.existsSync(path.join(current, ".git"))) {
            return current;
        }
        const parent = path.dirname(current);
        if (parent === current) {
            // Reached root
            return start;
        }
        current = parent;
    }
}
function resolveFactorDir(projectRoot) {
    return (0, config_1.getFactorDir)(projectRoot);
}
function resolveParadigmDir(projectRoot) {
    return (0, config_1.getParadigmDir)(projectRoot);
}
function resolveSchemaDir(projectRoot) {
    return (0, config_1.getSchemaDir)(projectRoot);
}
