import * as dotenv from "dotenv";
import * as path from "path";

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

export function getDefaultPaths(): typeof DEFAULTS {
  return DEFAULTS;
}

const configCache: Map<string, Record<string, string>> = new Map();

export function loadEnv(projectRoot: string): Record<string, string> {
  if (configCache.has(projectRoot)) {
    return configCache.get(projectRoot)!;
  }

  const envPath = path.join(projectRoot, ".env");
  let config: Record<string, string> = {};

  try {
    const result = dotenv.config({ path: envPath });
    config = result.parsed || {};
  } catch (error) {
    // .env file doesn't exist or is invalid
  }

  const merged = { ...DEFAULTS, ...config };
  configCache.set(projectRoot, merged);
  return merged;
}

export function getFactorDir(projectRoot: string): string {
  const config = loadEnv(projectRoot);
  return path.resolve(projectRoot, config.FACTOR_DIR);
}

export function getProseDir(projectRoot: string): string {
  const config = loadEnv(projectRoot);
  return path.resolve(projectRoot, config.PROSE_DIR);
}

export function getDataDir(projectRoot: string): string {
  const config = loadEnv(projectRoot);
  return path.resolve(projectRoot, config.DATA_DIR);
}

export function getProtocolDir(projectRoot: string): string {
  const config = loadEnv(projectRoot);
  return path.resolve(projectRoot, config.PROTOCOL_DIR);
}

export function getSchemaDir(projectRoot: string): string {
  const config = loadEnv(projectRoot);
  return path.resolve(projectRoot, config.SCHEMA_DIR);
}

export function getParadigmDir(projectRoot: string): string {
  const config = loadEnv(projectRoot);
  return path.resolve(projectRoot, config.PARADIGM_DIR);
}

export function getProbabilityMatrixDir(projectRoot: string): string {
  const config = loadEnv(projectRoot);
  return path.resolve(projectRoot, config.PROBABILITY_MATRIX_DIR);
}

export function getAcuRoot(projectRoot: string): string {
  const config = loadEnv(projectRoot);
  return config.ACU_ROOT || path.dirname(require.main?.filename || __dirname);
}
