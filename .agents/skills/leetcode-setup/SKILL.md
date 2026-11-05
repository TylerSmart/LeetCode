---
name: leetcode-setup
description: "Set up or scaffold a LeetCode problem from DESCRIPTION.md for C, C#, C++, Java, Python 3, Rust, and TypeScript with unsolved starters, example tests, and VS Code run/debug tasks. Format pasted descriptions into readable Markdown. Use when adding a problem, preparing language practice, adding Rust practice, or cleaning up a problem description."
argument-hint: "Problem number, e.g. 1385"
---

# LeetCode Setup

Create runnable practice scaffolds, not solutions.

1. Resolve the requested problem number or folder to problems/<number> in this
   repository. All numbered problem folders belong under problems/, not at the
   repository root. If omitted, use the active DESCRIPTION.md. Ask for the
   folder only if neither identifies it.
2. Read DESCRIPTION.md and any applicable repository instructions. Extract the
   inputs, output, constraints, and every published example. Format pasted text
   into readable Markdown before scaffolding: use a level-one problem title,
   difficulty, section headings, numbered example headings, fenced text blocks
   for inputs/outputs and multiline calculations, inline code for identifiers,
   and a constraint list. Remove only copied page controls (such as "Topics",
   "premium lock icon", "Companies", or an empty "Hint" label), not actual
   topics, hints, or problem content. Preserve all wording, example values,
   explanations, constraints, and meaningful links; do not add solution hints.
   Leave already formatted descriptions alone except for necessary cleanup.
   If asked only to format a description, stop after formatting and checking
   content preservation; do not scaffold or modify solution files.
   If an interface cannot be inferred unambiguously, ask for the
   LeetCode starter signature instead of inventing an incompatible interface.
3. Use problems/1385 as the local layout reference. Prepare these folders inside
   the requested problem folder:
   C, C#, C++, Java, Python, Rust, TypeScript. Preserve all existing solutions and
   user tests. Create only missing files; ask before changing an existing API.
4. Keep submission code separate from runners:
   - C: solution.h, solution.c, main.c; standard LeetCode C signature.
   - C#: Solution.cs, Program.cs, Practice.csproj; public Solution class.
   - C++: solution.hpp, main.cpp; public methods in class Solution.
   - Java: Solution.java, Main.java; class Solution, public class Main runner.
   - Python 3: solution.py, main.py; class Solution and LeetCode method name.
   - Rust: Cargo.toml, solution.rs, main.rs; snake_case associated methods in
     impl Solution. Keep pub struct Solution in the local solution module;
     LeetCode submissions copy only impl Solution. Name the Cargo package
     leetcode-<number>, with a practice binary whose path is main.rs. The root
     Cargo workspace discovers `problems/*/Rust` automatically. Keep Cargo.lock tracked
     at the root and build output under .build through the shared runner.
   - TypeScript: solution.ts, main.ts, tsconfig.json; exported function.
     LeetCode submission omits the export keyword.
5. Leave each algorithm unimplemented. Use a clear exception where supported;
   for C, use an explicit placeholder result. No hints, pseudocode, or completed
   algorithms unless the user requests them.
6. Put all description examples into each runner using native typed values.
   Call the real solution API, compare actual and expected structurally, print
   each case's outcome, and return a nonzero exit code on failures. Report
   exceptions per case and continue. Keep inputs fresh for mutating solutions.
   Add list/tree construction and serialization helpers only when required.
7. Reuse the root scripts/run.ps1, scripts/start.mjs, .vscode/tasks.json, and TypeScript dependency;
   do not create another task set or runner script per problem. Match the file
   names above so the shared runner works. Copy the reference project and
   tsconfig settings, adjusting the problem number and paths for the new
   location. TypeScript's default output is ../../../.build/<number>/TypeScript
   relative to its language folder.
8. Run each available language through scripts/run.ps1 -Problem <folder>
   -Language <language>. Unsolved examples SHOULD fail: distinguish those
   failures from compile errors or missing tools. Fix scaffold errors without
   implementing the solution. Report unavailable toolchains honestly.
9. Tell the user which solution files to edit and to run npm start from the
   repository root to choose a problem and language. The interactive launcher
   discovers numeric folders inside problems/ and offers languages with the expected files;
   no per-problem menu registration is needed. Mention VS Code tasks as an alternative.
   Mention any signature assumptions and missing tools. Never install system
   toolchains or overwrite practice work without permission.
