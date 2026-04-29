import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { findProjectRoot } from "../core/paths";
import { getDefaultPaths } from "../core/config";

const RED = "\x1b[91m";
const GREEN = "\x1b[92m";
const YELLOW = "\x1b[93m";
const CYAN = "\x1b[96m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function generateEnvFile(acuRootPath?: string, customPaths?: Record<string, string>): string {
  const defaults = getDefaultPaths();
  const lines = [
    "# ACU Project Configuration",
    "# Paths are relative to this file's location (project root)",
    "# Use absolute paths if needed",
    "",
    "# ACU Framework Root (empty = auto-detect from installation)",
    `ACU_ROOT=${acuRootPath || ""}`,
    "",
    "# Project Directories",
    `FACTOR_DIR=${defaults.FACTOR_DIR}`,
    `SCHEMA_DIR=${defaults.SCHEMA_DIR}`,
    `PARADIGM_DIR=${defaults.PARADIGM_DIR}`,
    `PROTOCOL_DIR=${defaults.PROTOCOL_DIR}`,
    `PROSE_DIR=${defaults.PROSE_DIR}`,
    `DATA_DIR=${defaults.DATA_DIR}`,
  ];

  if (customPaths) {
    lines.push("");
    lines.push("# Custom Paths (override defaults above)");
    for (const [key, value] of Object.entries(customPaths)) {
      lines.push(`${key}=${value}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

function generateSampleFactor(): any {
  const nodes = "xyz0123456789abcdef".split("");
  const cilang: Record<string, any> = {};
  for (const node of nodes) {
    cilang[node] = {
      label: `Node${node.toUpperCase()}`,
      definition: "",
      role: "",
      manifestation: "",
      value: 0,
      phase_offset: 0,
    };
  }

  return {
    namespace: "HelloWorld",
    imports: [],
    version: "1.0.0",
    status: "partial",
    label: "HelloWorld",
    definition: "A minimal sample Factor created by acu init.",
    role: "To demonstrate the Factor structure and validate the project setup.",
    manifestation: "This Factor serves as a template and test artifact.",
    cilang,
    type_binding: {
      resonance: { n: 1, m: 1, chirality: "right" },
      quantization: { base: 19, formula: "19^n × 2^m" },
      usepong_binding: { stratum: "global" },
      view_mode: { default_mode: "knot" },
    },
  };
}

function createDirectoryStructure(projectRoot: string, dirs: string[]): string[] {
  const created: string[] = [];
  for (const dirPath of dirs) {
    const fullPath = path.join(projectRoot, dirPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      created.push(fullPath);
    }
  }
  return created;
}

function createGitignore(projectRoot: string): string {
  const gitignorePath = path.join(projectRoot, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    return gitignorePath;
  }

  const content = `# ACU Project Gitignore

# Temporary and scratch files
tmp/
tools/
*.tmp

# TypeScript
dist/
node_modules/
*.tsbuildinfo

# Environment (contains local paths)
# .env

# OS
.DS_Store
Thumbs.db
`;

  fs.writeFileSync(gitignorePath, content);
  return gitignorePath;
}

export function createInitCommand(): Command {
  const command = new Command("init");

  command
    .description("initialize a new ACU project with directory structure and .env configuration")
    .argument("[path]", "Project directory", ".")
    .option("--force", "Overwrite existing .env and directories")
    .option("--no-sample", "Skip creating the sample HelloWorld Factor")
    .option("--no-color", "Disable colored output")
    .action((targetPath: string, options: any) => {
      const noColor = options.color === false;
      const red = noColor ? "" : RED;
      const green = noColor ? "" : GREEN;
      const yellow = noColor ? "" : YELLOW;
      const cyan = noColor ? "" : CYAN;
      const dim = noColor ? "" : DIM;
      const bold = noColor ? "" : BOLD;
      const reset = noColor ? "" : RESET;

      const projectRoot = path.resolve(targetPath);
      const envFile = path.join(projectRoot, ".env");

      // Check if already initialized
      if (fs.existsSync(envFile) && !options.force) {
        console.log(`${yellow}Warning:${reset} Project already initialized at ${projectRoot}`);
        console.log(`  Use ${bold}--force${reset} to reinitialize and overwrite .env`);
        process.exit(0);
      }

      console.log(`\n${bold}Initializing ACU Project${reset}`);
      console.log(`${dim}Location:${reset} ${projectRoot}\n`);

      // Determine ACU root path (search from cwd first, then project_root)
      let acuRoot = "";
      const cwd = process.cwd();
      const possiblePaths = [
        path.join(cwd, "node_modules", "acu"),
        path.join(cwd, "..", "..", "node_modules", "acu"),
        path.join(projectRoot, "node_modules", "acu"),
      ];

      for (const possible of possiblePaths) {
        if (fs.existsSync(possible)) {
          acuRoot = possible;
          break;
        }
      }

      // Create directory structure
      const defaults = getDefaultPaths();
      const dirsToCreate = [
        defaults.FACTOR_DIR,
        defaults.SCHEMA_DIR,
        defaults.PARADIGM_DIR,
        defaults.PROTOCOL_DIR,
        defaults.PROSE_DIR,
        defaults.DATA_DIR,
      ];

      console.log(`${bold}Creating Directories${reset}`);
      const createdDirs = createDirectoryStructure(projectRoot, dirsToCreate);
      for (const dir of createdDirs) {
        const relPath = path.relative(projectRoot, dir);
        console.log(`  ${green}✓${reset} ${relPath}`);
      }

      // Create .gitignore
      console.log(`\n${bold}Creating .gitignore${reset}`);
      createGitignore(projectRoot);
      console.log(`  ${green}✓${reset} .gitignore`);

      // Create .env
      console.log(`\n${bold}Creating .env${reset}`);
      const envContent = generateEnvFile(acuRoot);
      fs.writeFileSync(envFile, envContent);
      console.log(`  ${green}✓${reset} .env`);

      // Create sample Factor
      if (!options.sample) {
        const sampleFactor = generateSampleFactor();
        const factorDir = path.join(projectRoot, defaults.FACTOR_DIR);
        const factorPath = path.join(factorDir, "HelloWorld.json");
        fs.writeFileSync(factorPath, JSON.stringify(sampleFactor, null, 2));
        console.log(`  ${green}✓${reset} factor/HelloWorld.json (sample Factor)`);
      }

      console.log(`\n${green}✓${reset} Project initialized successfully!`);
      console.log(`${dim}Next steps:${reset}`);
      console.log(`  1. Edit .env to configure paths if needed`);
      console.log(`  2. Add your Factor JSON files to ${defaults.FACTOR_DIR}/`);
      console.log(`  3. Run ${bold}acu validate factor "factor/**/*.json"${reset} to check your files`);
    });

  return command;
}
