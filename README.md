<p>
  <img src="/promptfusion.png">
  <h1>promptfusion</h1>
</p>

It copies entire directory contents to your clipboard for pasting into prompts.

- Automatically bails if the contents will be more than the GPT-4 token limit.
- Any file it ignores, it still adds them to the list of files for complete context.
- copy out just a pretty directory tree if you want that for context (it's appended to the full contents string by default).
- Ignores:
  - common media formats
  - common lock files

## Usage

`npm i -g promptfusion`

Simply, `promptf` will copy all CWD contents to your clipboard.

Options:

`promptf input output` like this `promptf ./src ./my-output.txt`

If you put an output file path it will write to that text file, not copy to clipboard.

`promptf --map` to copy the directory tree only.

## Todo

Rewrite in Rust. Just kidding, it's pretty fast.

---

<written by 🤖>
