import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

const cache: Map<string, any> = new Map();

export function loadJson(refPath: string, projectRoot?: string): any {
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
  } catch (error) {
    cache.set(refPath, null);
    return null;
  }
}

export function looksLikeLocalPath(value: any): boolean {
  return (
    typeof value === "string" &&
    value.endsWith(".json") &&
    value.includes("/") &&
    !value.startsWith("http://") &&
    !value.startsWith("https://") &&
    !path.isAbsolute(value)
  );
}

export function discoverJsonFiles(srcDir: string, baseRef: string): Record<string, any> {
  if (!fs.existsSync(srcDir)) {
    return {};
  }

  const entries: Record<string, any> = {};
  const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".json"));

  for (const file of files.sort()) {
    const stem = path.parse(file).name;
    entries[stem] = { $ref: `${baseRef}/${file}` };
  }

  return entries;
}

export async function collectFactorFiles(pattern: string, projectRoot: string): Promise<string[]> {
  const files = await glob(pattern, { cwd: projectRoot });
  return files.filter((f) => f.endsWith(".json")).map((f) => path.resolve(projectRoot, f));
}
