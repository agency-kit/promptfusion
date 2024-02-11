import { test } from 'uvu';
import * as assert from 'uvu/assert';
import fs from 'fs';
import path from 'path';
import { concatenateFiles, generateDirectoryMap } from './promptfusion';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper function to setup test directory and files
function setupTestEnvironment(files: { name: string; content: string }[]): string {
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  files.forEach(file => {
    fs.writeFileSync(path.join(testDir, file.name), file.content, 'utf8');
  });
  return testDir;
}

// Helper function for cleanup after tests
function cleanupTestEnvironment(testDir: string): void {
  fs.rmSync(testDir, { recursive: true, force: true });
}

// Test concatenating files and verifying content
test('Concatenate Files and Verify Content', async () => {
  const testDir = setupTestEnvironment([
    { name: 'file1.txt', content: 'Hello from file 1' },
    { name: 'file2.txt', content: 'Hello from file 2' }
  ]);
  const outputFile = path.join(testDir, 'output.txt');

  await concatenateFiles(testDir, outputFile, false);

  const expectedContent = `file1.txt\nfile2.txt\n\nTitle: file1.txt\nPath: test/test-files/file1.txt\n\nHello from file 1\n\n` +
    `Title: file2.txt\nPath: test/test-files/file2.txt\n\nHello from file 2\n\n`;
  const actualContent = fs.readFileSync(outputFile, 'utf8');
  assert.is(actualContent === expectedContent, true, 'Concatenated content matches expected');

  cleanupTestEnvironment(testDir);
});

// Test generating directory map
test('Generate Directory Map', async () => {
  const testDir = setupTestEnvironment([
    { name: 'file1.txt', content: 'Content of file 1' },
    { name: 'file2.txt', content: 'Content of file 2' }
  ]);

  const dirMap = await generateDirectoryMap(testDir);

  // Simplified check for file presence in the directory map
  assert.ok(dirMap.includes('file1.txt'), 'Directory map includes file1.txt');
  assert.ok(dirMap.includes('file2.txt'), 'Directory map includes file2.txt');

  cleanupTestEnvironment(testDir);
});

test.run();
