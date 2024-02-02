#!/usr/bin/env node

import { concatenateFiles } from "./promptfusion.js";

const args = process.argv.slice(2);
const directoryPath = args.find(arg => !arg.startsWith('--')) || process.cwd();
const outputPath = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;
const shouldMap = args.includes('--map');

console.log('running promptfusion...');

concatenateFiles(directoryPath, outputPath, shouldMap)
  .catch(err => console.error(err));
