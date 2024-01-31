<p>
  <img src="/promptfusion.png">
  <h1>promptfusion</h1>
</p>

It copies entire directory contents to your clipboard for pasting into prompts.

- Automatically bails if the contents will be more than the GPT-4 token limit.
- Any file it ignores, it still adds them to the list of files for complete context.
- Ignores:
  - common media formats
  - package-lock.json

## Usage

`npm i -g promptfusion`

Simply, `promptf` will copy all CWD contents to your clipboard.

Options:

`promptf input output` like this `promptf ./src ./my-output.txt`

If you put an output file path it will write to that text file, not copy to clipboard.

## Todo

Rewrite in Rust. Just kidding, it's pretty fast.
