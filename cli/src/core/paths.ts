import * as path from "path";
import * as fs from "fs";
import { getFactorDir, getParadigmDir, getSchemaDir, getAcuRoot } from "./config";

export function findProjectRoot(start?: string): string {
  if (!start) {
    start = process.cwd();
  }

  let current = start;
  while (true) {
    if (
      fs.existsSync(path.join(current, ".env")) ||
      fs.existsSync(path.join(current, "acu")) ||
      fs.existsSync(path.join(current, ".git"))
    ) {
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

export function resolveFactorDir(projectRoot: string): string {
  return getFactorDir(projectRoot);
}

export function resolveParadigmDir(projectRoot: string): string {
  return getParadigmDir(projectRoot);
}

export function resolveSchemaDir(projectRoot: string): string {
  return getSchemaDir(projectRoot);
}
