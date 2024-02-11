// src/promptfusion.test.ts
import { test } from "uvu";
import * as assert from "uvu/assert";
import fs2 from "fs";
import path2 from "path";

// src/promptfusion.ts
import fs from "fs";
import path from "path";
import { isWithinTokenLimit } from "gpt-tokenizer";
import * as globby from "globby";
import clipboardy from "clipboardy";
import prettyFileTree from "pretty-file-tree";
var TOKEN_LIMIT = 32e4;
var MEDIA_FILE_EXTENSIONS = [".webp", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".mp4", ".mp3", ".avi", ".mov", ".wmv", ".flac", ".wav"];
var SKIP_FILES = ["yarn.lock", "package-lock.json", ".gitignore"];
function shouldSkipFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);
  return MEDIA_FILE_EXTENSIONS.includes(extension) || SKIP_FILES.includes(basename);
}
async function processFile(filePath) {
  console.log("[promptfusion]:", filePath);
  const relativeFilePath = path.relative(process.cwd(), filePath);
  const fileHeader = `Title: ${path.basename(filePath)}
Path: ${relativeFilePath}

`;
  if (shouldSkipFile(filePath)) {
    return fileHeader;
  } else {
    const fileContent = fs.readFileSync(filePath, "utf8");
    return fileHeader + fileContent + "\n\n";
  }
}
async function concatenateFiles(inputDir, outputFile, mapOnly) {
  const dirMap = await generateDirectoryMap(inputDir);
  if (mapOnly) {
    console.log("Directory map generated.");
    clipboardy.writeSync(dirMap);
    return;
  }
  const filePaths = await globby.globby(["**/*", "!**/.git/**"], { cwd: inputDir, gitignore: true, onlyFiles: true, dot: true });
  let combinedContent = dirMap + "\n\n";
  for (const filePath of filePaths) {
    const fullFilePath = path.join(inputDir, filePath);
    const contentWithHeader = await processFile(fullFilePath);
    if (!isWithinTokenLimit(combinedContent + contentWithHeader, TOKEN_LIMIT)) {
      console.warn("Warning: The combined content exceeds the GPT-4 token limit.");
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
async function generateDirectoryMap(dirPath) {
  const paths = await globby.globby(["**", "!**/.git/**", "!node_modules/**"], {
    cwd: dirPath,
    gitignore: true,
    onlyDirectories: false,
    onlyFiles: false,
    dot: true
  });
  return prettyFileTree(paths);
}

// src/promptfusion.test.ts
import { fileURLToPath } from "url";
var __dirname = path2.dirname(fileURLToPath(import.meta.url));
function setupTestEnvironment(files) {
  const testDir = path2.join(__dirname, "test-files");
  if (!fs2.existsSync(testDir)) {
    fs2.mkdirSync(testDir, { recursive: true });
  }
  files.forEach((file) => {
    fs2.writeFileSync(path2.join(testDir, file.name), file.content, "utf8");
  });
  return testDir;
}
function cleanupTestEnvironment(testDir) {
  fs2.rmSync(testDir, { recursive: true, force: true });
}
test("Concatenate Files and Verify Content", async () => {
  const testDir = setupTestEnvironment([
    { name: "file1.txt", content: "Hello from file 1" },
    { name: "file2.txt", content: "Hello from file 2" }
  ]);
  const outputFile = path2.join(testDir, "output.txt");
  await concatenateFiles(testDir, outputFile, false);
  const expectedContent = `file1.txt
file2.txt

Title: file1.txt
Path: test/test-files/file1.txt

Hello from file 1

Title: file2.txt
Path: test/test-files/file2.txt

Hello from file 2

`;
  const actualContent = fs2.readFileSync(outputFile, "utf8");
  assert.is(actualContent === expectedContent, true, "Concatenated content matches expected");
  cleanupTestEnvironment(testDir);
});
test("Generate Directory Map", async () => {
  const testDir = setupTestEnvironment([
    { name: "file1.txt", content: "Content of file 1" },
    { name: "file2.txt", content: "Content of file 2" }
  ]);
  const dirMap = await generateDirectoryMap(testDir);
  assert.ok(dirMap.includes("file1.txt"), "Directory map includes file1.txt");
  assert.ok(dirMap.includes("file2.txt"), "Directory map includes file2.txt");
  cleanupTestEnvironment(testDir);
});
test.run();
