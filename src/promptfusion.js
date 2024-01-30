#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { encode, isWithinTokenLimit } from 'gpt-tokenizer';
import * as globby from 'globby';
import clipboardy from 'clipboardy';


async function processFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const relativeFilePath = path.relative(process.cwd(), filePath);
  const fileHeader = `Title: ${path.basename(filePath)}\nPath: ${relativeFilePath}\n\n`;
  const contentWithHeader = fileHeader + fileContent + '\n\n';

  return contentWithHeader;
}

//TODO: ignore common image formats
//TODO: add ability to filter files
export async function concatenateFiles(inputDir, outputFile = null) {
  const filePaths = await globby.globby(['**/*'], { cwd: inputDir, gitignore: true, onlyFiles: true });
  let combinedContent = '';

  for (const filePath of filePaths) {
    const fullFilePath = path.join(inputDir, filePath);
    const contentWithHeader = await processFile(fullFilePath);

    if (!isWithinTokenLimit(combinedContent + contentWithHeader)) {
      console.warn('Warning: The combined content exceeds the GPT-4 token limit.');
      console.warn(`Token limit exceeded while processing file: ${fullFilePath}`);
      process.exit(1);
    }

    combinedContent += contentWithHeader;
  }

  if (outputFile) {
    fs.writeFileSync(outputFile, combinedContent);
    console.log(`Files have been successfully combined into ${outputFile}!`);
  } else {
    try {
      clipboardy.writeSync(combinedContent);
      console.log("Content has been copied to the clipboard.");
    } catch (error) {
      console.error("Failed to copy content to the clipboard. Error:", error);
    }
  }
}
