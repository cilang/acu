import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { findProjectRoot } from "../core/paths";
import { loadJson, collectFactorFiles } from "../core/loader";
import { validateFactorSchema } from "../core/schema";

const RED = "\x1b[91m";
const GREEN = "\x1b[92m";
const YELLOW = "\x1b[93m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

function matchesPattern(str: string, patterns: string[]): boolean {
  if (patterns.length === 0) return false;
  return patterns.some((pat) => {
    const regex = new RegExp(`^${pat.replace(/\*/g, ".*")}$`);
    return regex.test(str);
  });
}

export function createMergeCommand(): Command {
  const command = new Command("merge");

  command
    .description("merge all Factor JSON files into a single file")
    .option("--source <dir>", "Directory to scan for Factor JSON files (default: factor/)")
    .option("--output <path>", "Output merged JSON file path (default: dist/acu-factor.json)")
    .option("--exclude-namespace <pattern>", "Exclude Factor by namespace glob pattern")
    .option("--exclude-folder <pattern>", "Exclude entire folder path")
    .option("--validate", "Validate each Factor against schema before merging")
    .option("--schema <path>", "Path to schema file (auto-discovers if not set)")
    .option("--no-pretty", "Don't pretty-print output JSON")
    .option("--filter-paradigm <paradigm>", "Only include Factors matching this paradigm")
    .option("--filter-status <status>", "Only include 'partial' or 'complete' Factors")
    .action(async (options: any) => {
      const projectRoot = findProjectRoot();
      const srcDir = options.source ? path.resolve(projectRoot, options.source) : path.join(projectRoot, "factor");
      const outFile = options.output
        ? path.resolve(projectRoot, options.output)
        : path.join(projectRoot, "dist", "acu-factor.json");

      if (!fs.existsSync(srcDir)) {
        console.error(`${RED}Error:${RESET} source directory not found: ${srcDir}`);
        process.exit(1);
      }

      // Parse filter status if provided
      if (options.filterStatus && !["partial", "complete"].includes(options.filterStatus)) {
        console.error(`${RED}Error:${RESET} status must be 'partial' or 'complete'`);
        process.exit(1);
      }

      // Load schema if validation requested
      let schema: any = null;
      if (options.validate) {
        const candidates = [
          options.schema ? path.resolve(projectRoot, options.schema) : null,
          path.join(projectRoot, "data", "schema", "factor.schema.json"),
        ];
        for (const candidate of candidates) {
          if (candidate && fs.existsSync(candidate)) {
            schema = loadJson(candidate);
            if (schema && typeof schema === "object") {
              delete schema.$schema;
            }
            break;
          }
        }
        if (!schema) {
          console.error(`${RED}Error:${RESET} schema not found`);
          process.exit(1);
        }
      }

      // Discover files
      const allFiles = await collectFactorFiles(path.join(srcDir, "**/*.json"), srcDir);
      console.log(`${DIM}Discovered:${RESET} ${allFiles.length} files in ${path.relative(projectRoot, srcDir)}`);

      // Process
      const factors: Record<string, any> = {};
      let skipped = 0;
      const warnedNs = new Set<string>();

      for (const fp of allFiles) {
        // Check folder exclusions
        const relPath = path.relative(srcDir, fp);
        if (options.excludeFolder && matchesPattern(relPath, [options.excludeFolder].flat())) {
          skipped++;
          continue;
        }

        try {
          const data = loadJson(fp);
          if (!data) {
            skipped++;
            console.log(`  ${YELLOW}⚠${RESET} skipped (invalid JSON): ${path.relative(projectRoot, fp)}`);
            continue;
          }

          const ns = data.namespace || "";

          // Check namespace exclusions
          if (options.excludeNamespace && matchesPattern(ns, [options.excludeNamespace].flat())) {
            skipped++;
            continue;
          }

          // Validate
          if (options.validate && schema) {
            const errs = validateFactorSchema(data, schema);
            if (errs.length > 0) {
              skipped++;
              console.log(`  ${YELLOW}⚠${RESET} skipped (validation): ${ns}`);
              continue;
            }
          }

          // Filter by paradigm
          if (options.filterParadigm) {
            const paradigm = data.type_binding?.paradigm || "";
            if (paradigm !== options.filterParadigm) {
              skipped++;
              continue;
            }
          }

          // Filter by status
          if (options.filterStatus) {
            const status = data.status || "";
            if (status !== options.filterStatus) {
              skipped++;
              continue;
            }
          }

          // Merge
          if (ns in factors) {
            if (!warnedNs.has(ns)) {
              console.log(`  ${YELLOW}⚠${RESET} namespace collision: ${ns} (overwritten)`);
              warnedNs.add(ns);
            }
          }
          factors[ns] = data;
        } catch (error) {
          skipped++;
          console.log(`  ${YELLOW}⚠${RESET} skipped (error): ${path.relative(projectRoot, fp)}`);
        }
      }

      // Build output
      const result = {
        factors,
        meta: {
          total: Object.keys(factors).length,
          generated_at: new Date().toISOString(),
          source: path.relative(projectRoot, srcDir),
        },
      };

      // Write
      const outDir = path.dirname(outFile);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      const indent = options.pretty ? 2 : 0;
      fs.writeFileSync(outFile, JSON.stringify(result, null, indent) + (options.pretty ? "\n" : ""));

      const stats = fs.statSync(outFile);
      console.log(`\n${GREEN}✓${RESET}  Wrote ${path.relative(projectRoot, outFile)} (${stats.size} bytes)`);
      console.log(`  ${DIM}Merged:${RESET} ${Object.keys(factors).length} Factors`);
      if (skipped) {
        console.log(`  ${DIM}Skipped:${RESET} ${skipped}`);
      }
    });

  return command;
}
