import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import {
  validateFactorSchema,
  validateParadigmSchema,
  checkFactorInvariants,
  checkParadigmInvariants,
  CheckResult,
} from "../core/schema";
import { findProjectRoot } from "../core/paths";
import { loadJson, collectFactorFiles } from "../core/loader";

const RED = "\x1b[91m";
const GREEN = "\x1b[92m";
const YELLOW = "\x1b[93m";
const RESET = "\x1b[0m";

function loadSchema(name: string, projectRoot: string): any {
  const candidates = [path.join(projectRoot, "data", "schema", name), name];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const schema = loadJson(candidate);
      // Remove $schema to avoid AJV draft issues
      if (schema && typeof schema === "object") {
        delete schema.$schema;
      }
      return schema;
    }
  }

  console.error(`${RED}Error: schema not found: ${name}${RESET}`);
  process.exit(1);
}

function printResult(
  filepath: string,
  schemaErrs: string[],
  invErrs: CheckResult[],
  index: number,
  total: number,
  noColor: boolean,
): boolean {
  let ns = "";
  try {
    const data = loadJson(filepath);
    ns = data.namespace || data.name || "";
  } catch (error) {
    // Ignore
  }

  const passed = schemaErrs.length === 0 && invErrs.length === 0;
  const color = noColor ? "" : passed ? GREEN : RED;
  const status = passed ? "PASS" : "FAIL";

  console.log(
    `${color}${status}${RESET} [${index}/${total}] ${path.relative(process.cwd(), filepath)} ${ns ? `(${ns})` : ""}`,
  );

  if (!passed) {
    for (const err of schemaErrs) {
      console.log(`  ${RED}Schema: ${err}${RESET}`);
    }
    for (const err of invErrs) {
      console.log(`  ${YELLOW}Invariant [${err.category}]: ${err.message}${RESET}`);
    }
  }

  return passed;
}

export function createValidateCommand(): Command {
  const command = new Command("validate");

  command
    .description("validate Factor or Paradigm JSON files")
    .argument("<type>", 'Type to validate: "factor" or "paradigm"')
    .argument("<pattern>", "File pattern or path to validate")
    .option("--strict", "Treat warnings as errors")
    .option("--no-color", "Disable colored output")
    .action(async (type: string, pattern: string, options: any) => {
      const projectRoot = findProjectRoot();
      const schema = loadSchema(`${type}.schema.json`, projectRoot);

      const files = await collectFactorFiles(pattern, projectRoot);
      let passed = 0;
      let total = 0;

      for (const file of files) {
        total++;
        const data = loadJson(file);

        let schemaErrs: string[];
        let invErrs: CheckResult[];

        if (type === "factor") {
          schemaErrs = validateFactorSchema(data, schema);
          invErrs = checkFactorInvariants(data, projectRoot);
        } else if (type === "paradigm") {
          schemaErrs = validateParadigmSchema(data, schema);
          invErrs = checkParadigmInvariants(data, projectRoot);
        } else {
          console.error(`${RED}Error: Invalid type '${type}'. Must be 'factor' or 'paradigm'${RESET}`);
          process.exit(1);
        }

        if (printResult(file, schemaErrs, invErrs, total, files.length, options.noColor)) {
          passed++;
        }
      }

      const overallPassed = passed === total;
      const exitCode = overallPassed ? 0 : 1;

      console.log(`\n${overallPassed ? GREEN : RED}Result: ${passed}/${total} files passed${RESET}`);
      process.exit(exitCode);
    });

  return command;
}
