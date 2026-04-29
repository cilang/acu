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
exports.getDefaultPaths = getDefaultPaths;
exports.loadEnv = loadEnv;
exports.getFactorDir = getFactorDir;
exports.getProseDir = getProseDir;
exports.getDataDir = getDataDir;
exports.getProtocolDir = getProtocolDir;
exports.getSchemaDir = getSchemaDir;
exports.getParadigmDir = getParadigmDir;
exports.getProbabilityMatrixDir = getProbabilityMatrixDir;
exports.getAcuRoot = getAcuRoot;
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const DEFAULTS = {
    FACTOR_DIR: "factor",
    PROSE_DIR: "prose",
    DATA_DIR: "data",
    PROTOCOL_DIR: "data/protocol",
    SCHEMA_DIR: "data/schema",
    PARADIGM_DIR: "data/factor_paradigms",
    PROBABILITY_MATRIX_DIR: "data/probability_matrix",
    ACU_ROOT: "",
};
function getDefaultPaths() {
    return DEFAULTS;
}
const configCache = new Map();
function loadEnv(projectRoot) {
    if (configCache.has(projectRoot)) {
        return configCache.get(projectRoot);
    }
    const envPath = path.join(projectRoot, ".env");
    let config = {};
    try {
        const result = dotenv.config({ path: envPath });
        config = result.parsed || {};
    }
    catch (error) {
        // .env file doesn't exist or is invalid
    }
    const merged = { ...DEFAULTS, ...config };
    configCache.set(projectRoot, merged);
    return merged;
}
function getFactorDir(projectRoot) {
    const config = loadEnv(projectRoot);
    return path.resolve(projectRoot, config.FACTOR_DIR);
}
function getProseDir(projectRoot) {
    const config = loadEnv(projectRoot);
    return path.resolve(projectRoot, config.PROSE_DIR);
}
function getDataDir(projectRoot) {
    const config = loadEnv(projectRoot);
    return path.resolve(projectRoot, config.DATA_DIR);
}
function getProtocolDir(projectRoot) {
    const config = loadEnv(projectRoot);
    return path.resolve(projectRoot, config.PROTOCOL_DIR);
}
function getSchemaDir(projectRoot) {
    const config = loadEnv(projectRoot);
    return path.resolve(projectRoot, config.SCHEMA_DIR);
}
function getParadigmDir(projectRoot) {
    const config = loadEnv(projectRoot);
    return path.resolve(projectRoot, config.PARADIGM_DIR);
}
function getProbabilityMatrixDir(projectRoot) {
    const config = loadEnv(projectRoot);
    return path.resolve(projectRoot, config.PROBABILITY_MATRIX_DIR);
}
function getAcuRoot(projectRoot) {
    const config = loadEnv(projectRoot);
    return config.ACU_ROOT || path.dirname(require.main?.filename || __dirname);
}
