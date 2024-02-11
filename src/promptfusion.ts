#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { isWithinTokenLimit } from 'gpt-tokenizer';
import * as globby from 'globby';
import clipboardy from 'clipboardy';
import prettyFileTree from 'pretty-file-tree';

// Define types for file extensions and paths
type FileExtension = string;
type FilePath = string;

const TOKEN_LIMIT = 32_0000;

// List of common media file extensions to ignore
const MEDIA_FILE_EXTENSIONS: FileExtension[] = ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.mp4', '.mp3', '.avi', '.mov', '.wmv', '.flac', '.wav'];
const SKIP_FILES: string[] = ['yarn.lock', 'package-lock.json', '.gitignore'];

function shouldSkipFile(filePath: FilePath): boolean {
  const extension = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);
  return MEDIA_FILE_EXTENSIONS.includes(extension) || SKIP_FILES.includes(basename);
}

async function processFile(filePath: FilePath): Promise<string> {
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

export async function concatenateFiles(inputDir: string, outputFile: string | null, mapOnly: boolean): Promise<void> {
  const dirMap: string = await generateDirectoryMap(inputDir);
  if (mapOnly) {
    console.log("Directory map generated.");
    clipboardy.writeSync(dirMap);
    return;
  }
  const filePaths: string[] = await globby.globby(['**/*', '!**/.git/**'], { cwd: inputDir, gitignore: true, onlyFiles: true, dot: true });
  let combinedContent: string = dirMap + '\n\n';

  for (const filePath of filePaths) {
    const fullFilePath: string = path.join(inputDir, filePath);
    const contentWithHeader: string = await processFile(fullFilePath);

    if (!isWithinTokenLimit(combinedContent + contentWithHeader, TOKEN_LIMIT)) {
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

export async function generateDirectoryMap(dirPath: string): Promise<string> {
  const paths: string[] = await globby.globby(['**', '!**/.git/**', '!node_modules/**'], {
    cwd: dirPath,
    gitignore: true,
    onlyDirectories: false,
    onlyFiles: false,
    dot: true,
  });

  return prettyFileTree(paths);
}
