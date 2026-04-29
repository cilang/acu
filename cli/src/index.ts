#!/usr/bin/env node

import { Command } from "commander";
import { createValidateCommand } from "./commands/validate";
import { createComposeCommand } from "./commands/compose";
import { createInitCommand } from "./commands/init";
import { createMergeCommand } from "./commands/merge";
import { createJsonMinifyCommand } from "./commands/jsonMinify";
import { createCheckCommand } from "./commands/check";
import { createScaffoldCommand } from "./commands/scaffold";
import { createUpdateCommand } from "./commands/update";
import { createUpdateVersionCommand } from "./commands/updateVersion";
// Import other commands as you implement them

const program = new Command();

program.name("acu").description("ACU Framework command-line tools").version("0.1.0");

program.addCommand(createValidateCommand());
program.addCommand(createComposeCommand());
program.addCommand(createInitCommand());
program.addCommand(createMergeCommand());
program.addCommand(createJsonMinifyCommand());
program.addCommand(createCheckCommand());
program.addCommand(createScaffoldCommand());
program.addCommand(createUpdateCommand());
program.addCommand(createUpdateVersionCommand());
// Add other commands...

program.parse();
