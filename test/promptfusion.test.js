import { test } from 'uvu';
import * as assert from 'uvu/assert';
import fs from 'fs';
import path from 'path';
import { concatenateFiles } from '../src/promptfusion.js';

// Helper function to create a sample file
function createSampleFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

test('Concatenate Files and Verify Content', () => {
  const testDir = path.join(process.cwd(), 'tests', 'test-files');
  const outputFile = path.join(process.cwd(), 'promptfusion-result.txt');

  // Ensure test directory exists
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create sample files
  const file1 = path.join(testDir, 'file1.txt');
  const file2 = path.join(testDir, 'file2.txt');
  createSampleFile(file1, 'Hello from file 1');
  createSampleFile(file2, 'Hello from file 2');

  // Run the concatenation function
  concatenateFiles(testDir, outputFile);

  // Read the output file and verify its content
  const expectedContent = `Title: file1.txt\nPath: ${file1}\n\nHello from file 1\n\n` +
    `Title: file2.txt\nPath: ${file2}\n\nHello from file 2\n\n`;
  const outputContent = fs.readFileSync(outputFile, 'utf8');
  assert.equal(outputContent, expectedContent);

  // Clean up: remove the test files and output
  fs.unlinkSync(file1);
  fs.unlinkSync(file2);
  fs.unlinkSync(outputFile);
  fs.rmdirSync(testDir);
});

test.run();
