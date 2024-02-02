#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { isWithinTokenLimit } from 'gpt-tokenizer';
import * as globby from 'globby';
import clipboardy from 'clipboardy';
import prettyFileTree from 'pretty-file-tree';

// List of common media file extensions to ignore
const MEDIA_FILE_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.mp4', '.mp3', '.avi', '.mov', '.wmv', '.flac', '.wav'];
const SKIP_FILES = ['yarn.lock', 'package-lock.json', '.gitignore'];


function shouldSkipFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);
  return MEDIA_FILE_EXTENSIONS.includes(extension) || SKIP_FILES.includes(basename);
}

async function processFile(filePath) {
  console.log('[promptfusion]:', filePath);
  const relativeFilePath = path.relative(process.cwd(), filePath);
  const fileHeader = `Title: ${path.basename(filePath)}\nPath: ${relativeFilePath}\n\n`;

  if (shouldSkipFile(filePath)) {
    return fileHeader; // Return only the header for media files
  } else {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileHeader + fileContent + '\n\n';
  }
}

export async function concatenateFiles(inputDir, outputFile = null, mapOnly = false) {
  const dirMap = await generateDirectoryMap(inputDir);
  if (mapOnly) {
    console.log("Directory map generated.");
    clipboardy.writeSync(dirMap);
    return;
  }
  const filePaths = await globby.globby(['**/*', '!**/.git/**'], { cwd: inputDir, gitignore: true, onlyFiles: true, dot: true });
  let combinedContent = dirMap + '\n\n';

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

export async function generateDirectoryMap(dirPath) {
  const paths = await globby.globby(['**', '!**/.git/**', '!node_modules/**'], {
    cwd: dirPath,
    gitignore: true,
    onlyDirectories: false,
    onlyFiles: false,
    dot: true,
  });

  return prettyFileTree(paths);
}
