import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";

const RED = "\x1b[91m";
const GREEN = "\x1b[92m";
const YELLOW = "\x1b[93m";
const RESET = "\x1b[0m";

export function createJsonMinifyCommand(): Command {
  const command = new Command("json-minify");

  command
    .description("minify JSON files by stripping whitespace")
    .argument("[files...]", "JSON files to minify")
    .option("--output <path>", "Output path (only valid with a single input file)")
    .option("--stdin", "Read JSON from stdin, write minified to stdout")
    .action((files: string[], options: any) => {
      if (options.stdin) {
        let input = "";
        const stdinBuffer = fs.readFileSync(0, "utf-8");
        try {
          const data = JSON.parse(stdinBuffer);
          process.stdout.write(JSON.stringify(data, null, 0).replace(/\s+/g, ""));
        } catch (error: any) {
          console.error(`${RED}Error:${RESET} invalid JSON: ${error.message}`);
          process.exit(1);
        }
        return;
      }

      if (files.length === 0 && !options.stdin) {
        console.error(`${RED}Error:${RESET} provide at least one file, or use --stdin`);
        process.exit(1);
      }

      if (options.output && files.length > 1) {
        console.error(`${RED}Error:${RESET} --output only works with a single input file`);
        process.exit(1);
      }

      for (const filePath of files) {
        const fp = path.resolve(filePath);
        try {
          const data = JSON.parse(fs.readFileSync(fp, "utf-8"));

          const target = options.output ? path.resolve(options.output) : fp;

          const targetDir = path.dirname(target);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          const minifiedContent = JSON.stringify(data, null, 0).replace(/\s+/g, "");
          fs.writeFileSync(target, minifiedContent);

          const originalSize = fs.statSync(fp).size;
          const newSize = fs.statSync(target).size;
          const reduction = originalSize > 0 ? ((1 - newSize / originalSize) * 100).toFixed(0) : 0;

          console.log(
            `  ${GREEN}✓${RESET} ${path.basename(fp)}: ${originalSize} → ${newSize} bytes (${reduction}% smaller)`,
          );
        } catch (error: any) {
          console.log(`  ${YELLOW}⚠${RESET} skipped: ${path.basename(fp)} (${error.message})`);
          continue;
        }
      }
    });

  return command;
}
