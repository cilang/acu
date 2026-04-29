import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { findProjectRoot, resolveFactorDir } from "../core/paths";

const RED = "\x1b[91m";
const YELLOW = "\x1b[93m";
const RESET = "\x1b[0m";

function isValidVersion(version: string): boolean {
  const pattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
  return pattern.test(version);
}

export function createUpdateVersionCommand(): Command {
  const command = new Command("update-version");

  command
    .description("batch update the version field in all Factor JSON files")
    .argument("<new_version>", "New version in x.y.z format")
    .option("--no-backup", "Skip creating .bak backups")
    .action((newVersion: string, options: any) => {
      if (!isValidVersion(newVersion)) {
        console.error(`${RED}Error: Invalid version format: '${newVersion}' (expected x.y.z)${RESET}`);
        process.exit(1);
      }

      const projectRoot = findProjectRoot();
      const factorDir = resolveFactorDir(projectRoot);

      if (!fs.existsSync(factorDir)) {
        console.error(`${RED}Error: Factor directory not found: ${factorDir}${RESET}`);
        process.exit(1);
      }

      let updatedCount = 0;
      let skippedCount = 0;

      // Find all .json files recursively under factor_dir
      function walk(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walk(fullPath);
          } else if (entry.isFile() && entry.name.endsWith(".json")) {
            try {
              const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));

              // Check if it's a Factor file (has 'version' field)
              if (data.version === undefined) {
                skippedCount++;
                continue;
              }

              const oldVersion = data.version;
              if (oldVersion === newVersion) {
                // Already at the target version
                continue;
              }

              // Update version
              data.version = newVersion;

              // Create backup if requested
              if (options.backup !== false) {
                const backupPath = fullPath + ".bak";
                try {
                  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
                } catch (error: any) {
                  console.log(`${YELLOW}Warning: Failed to create backup for ${fullPath}: ${error.message}${RESET}`);
                }
              }

              // Save updated file
              fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
              console.log(`Updated ${path.relative(projectRoot, fullPath)}: ${oldVersion} → ${newVersion}`);
              updatedCount++;
            } catch (error: any) {
              if (error.code === "ENOENT") {
                continue;
              }
              console.log(`${YELLOW}Warning: Skipping ${fullPath}: ${error.message}${RESET}`);
              skippedCount++;
            }
          }
        }
      }

      walk(factorDir);

      console.log(`\nSummary: ${updatedCount} files updated, ${skippedCount} files skipped.`);
    });

  return command;
}
