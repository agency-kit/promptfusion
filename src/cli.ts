#!/usr/bin/env node

import { concatenateFiles } from "./promptfusion";

// Process command line arguments
const args: string[] = process.argv.slice(2);
const directoryPath: string = args.find(arg => !arg.startsWith('--')) || process.cwd();
const outputPathIndex: number = args.indexOf('--output');
const outputPath: string | null = outputPathIndex > -1 ? args[outputPathIndex + 1] : null;
const shouldMap: boolean = args.includes('--map');

console.log('running promptfusion...');

concatenateFiles(directoryPath, outputPath, shouldMap)
  .catch(err => console.error(err));
