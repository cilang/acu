import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";

const RED = "\x1b[91m";
const YELLOW = "\x1b[93m";
const RESET = "\x1b[0m";

export function createUpdateCommand(): Command {
  const updateCmd = new Command("update");

  const cilangCmd = new Command("cilang")
    .description("update the label of cilang vertices x, y, z")
    .argument("<factor>", "Factor JSON file path")
    .option("--x <label>", "New label for cilang vertex x")
    .option("--y <label>", "New label for cilang vertex y")
    .option("--z <label>", "New label for cilang vertex z")
    .option("--no-backup", "Skip creating a .bak backup")
    .action((factor: string, options: any) => {
      const factorPath = path.resolve(factor);
      if (!fs.existsSync(factorPath)) {
        console.error(`${RED}Error: file not found: ${factorPath}${RESET}`);
        process.exit(1);
      }

      const data = JSON.parse(fs.readFileSync(factorPath, "utf-8"));
      const cilang = data.cilang || data.nodes;
      if (!cilang) {
        console.error(`${RED}Error: no 'cilang' or 'nodes' field in ${factorPath}${RESET}`);
        process.exit(1);
      }

      const updates: Record<string, string | undefined> = {
        x: options.x,
        y: options.y,
        z: options.z,
      };
      const applied: Record<string, { old: string; new: string }> = {};

      for (const [vid, newLabel] of Object.entries(updates)) {
        if (!newLabel) continue;
        const vertex = cilang[vid];
        if (!vertex) {
          console.log(`${YELLOW}Warning: cilang vertex '${vid}' not found, skipping.${RESET}`);
          continue;
        }
        const oldLabel = vertex.label || "(empty)";
        vertex.label = newLabel;
        applied[vid] = { old: oldLabel, new: newLabel };
      }

      if (Object.keys(applied).length === 0) {
        console.log("No labels specified. Use --x, --y, and/or --z.");
        return;
      }

      if (!options.backup) {
        const backupPath = factorPath + ".bak";
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
      }

      fs.writeFileSync(factorPath, JSON.stringify(data, null, 2));

      const ns = data.namespace || path.parse(factorPath).name;
      console.log(`${ns}:`);
      for (const [vid, change] of Object.entries(applied)) {
        console.log(`  ${vid}: ${change.old} → ${change.new}`);
      }
      if (!options.backup) {
        console.log(`  Backup: ${factorPath}.bak`);
      }
    });

  updateCmd.addCommand(cilangCmd);
  return updateCmd;
}
