#!/usr/bin/env node

import { concatenateFiles } from "./promptfusion.js";

const defaultInputDir = process.cwd();
const args = process.argv.slice(2);
const directoryPath = args[0] || defaultInputDir;
const outputPath = args[1] || null;

console.log('running promptfusion...');

concatenateFiles(directoryPath, outputPath)
  .catch(err => console.error(err));
