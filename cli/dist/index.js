#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const validate_1 = require("./commands/validate");
const compose_1 = require("./commands/compose");
const init_1 = require("./commands/init");
const merge_1 = require("./commands/merge");
const jsonMinify_1 = require("./commands/jsonMinify");
const check_1 = require("./commands/check");
const scaffold_1 = require("./commands/scaffold");
const update_1 = require("./commands/update");
const updateVersion_1 = require("./commands/updateVersion");
// Import other commands as you implement them
const program = new commander_1.Command();
program.name("acu").description("ACU Framework command-line tools").version("0.1.0");
program.addCommand((0, validate_1.createValidateCommand)());
program.addCommand((0, compose_1.createComposeCommand)());
program.addCommand((0, init_1.createInitCommand)());
program.addCommand((0, merge_1.createMergeCommand)());
program.addCommand((0, jsonMinify_1.createJsonMinifyCommand)());
program.addCommand((0, check_1.createCheckCommand)());
program.addCommand((0, scaffold_1.createScaffoldCommand)());
program.addCommand((0, update_1.createUpdateCommand)());
program.addCommand((0, updateVersion_1.createUpdateVersionCommand)());
// Add other commands...
program.parse();
