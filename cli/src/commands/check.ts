import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { collectFactorFiles } from "../core/loader";
import { findProjectRoot, resolveFactorDir } from "../core/paths";

const RED = "\x1b[91m";
const GREEN = "\x1b[92m";
const YELLOW = "\x1b[93m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function loadJson(filepath: string): any {
  try {
    const content = fs.readFileSync(filepath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

export function createCheckCommand(): Command {
  const command = new Command("check-namespaces");

  command
    .description("verify that Factor namespaces match their file paths")
    .argument("[targets...]", "file patterns or directories to check")
    .option("--no-color", "disable colored output")
    .action(async (targets: string[], options: any) => {
      const noColor = options.color === false;
      const red = noColor ? "" : RED;
      const green = noColor ? "" : GREEN;
      const yellow = noColor ? "" : YELLOW;
      const dim = noColor ? "" : DIM;
      const bold = noColor ? "" : BOLD;
      const reset = noColor ? "" : RESET;

      const projectRoot = findProjectRoot();
      const factorDir = resolveFactorDir(projectRoot);

      if (targets.length === 0) {
        targets = [factorDir];
      }

      let allFiles: string[] = [];
      for (const target of targets) {
        const files = await collectFactorFiles(target, projectRoot);
        allFiles.push(...files);
      }

      if (allFiles.length === 0) {
        console.error(`${red}Error: no JSON files found.${reset}`);
        process.exit(1);
      }

      console.log(`${dim}Checking namespaces for ${allFiles.length} files...${reset}`);

      let mismatches = 0;
      for (let i = 0; i < allFiles.length; i++) {
        const fp = allFiles[i];
        const data = loadJson(fp);

        if (!data) {
          console.log(`${red}✗${reset} ${fp}: Failed to load JSON`);
          mismatches++;
          continue;
        }

        const namespace = data.namespace;
        if (!namespace) {
          console.log(`${yellow}!${reset} ${fp}: No 'namespace' field found.`);
          continue;
        }

        // Calculate expected path relative to factor_dir
        // namespace "A/B/C" -> expected "A/B/C.json"
        const expectedRelPath = `${namespace}.json`;

        let actualRelPath: string;
        try {
          actualRelPath = path.relative(factorDir, fp);
        } catch (error) {
          // File is not under factor_dir, maybe it's an absolute path or outside project
          console.log(`${yellow}!${reset} ${fp}: File is outside the configured FACTOR_DIR (${factorDir})`);
          continue;
        }

        if (actualRelPath !== expectedRelPath) {
          console.log(`${red}✗${reset} ${bold}${fp}${reset}`);
          console.log(`  ${dim}Actual:${reset}   ${actualRelPath}`);
          console.log(`  ${dim}Expected:${reset} ${expectedRelPath} (from namespace: '${namespace}')`);
          mismatches++;
        } else {
          // Optional: verbose output for matches
          // console.log(`${green}✓${reset} ${fp}`);
        }
      }

      if (mismatches > 0) {
        console.log(`\n${red}Found ${mismatches} namespace mismatch(es).${reset}`);
        process.exit(1);
      } else {
        console.log(`\n${green}All namespaces match their file paths!${reset}`);
      }
    });

  return command;
}
