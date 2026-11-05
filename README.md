# LeetCode Practice

Problem sources live in `problems/<number>/`, with one subfolder per language.
Shared scripts, VS Code configuration, dependencies, and build output stay at
the repository root. Commands continue to use just the problem number.

## New Problem

1. Create a numeric folder under `problems/` (for example, `problems/1385`) and
   paste the problem text into `DESCRIPTION.md` inside it.
2. In Copilot Chat, run `/leetcode-setup 1385`. Alternatively, ask:
   "Use the leetcode-setup skill to scaffold problem 1385."
3. The skill prepares C, C#, C++, Java, Python 3, Rust, and TypeScript starters and
   runners using the published examples. It does not solve the problem or
   overwrite existing solutions. Check inferred signatures against LeetCode;
   paste the official starter signature into chat when needed.

The skill is stored in [.agents/skills/leetcode-setup/SKILL.md](.agents/skills/leetcode-setup/SKILL.md).
If its slash command is missing, reload the VS Code window and ensure agent
skills are enabled in Copilot settings. The skill requires Copilot agent access.

## Code And Run

Problem 1385 is ready. Edit only the solution file for your chosen language:

| Language   | Solution                                                                     | Required toolchain           |
| ---------- | ---------------------------------------------------------------------------- | ---------------------------- |
| C          | [problems/1385/C/solution.c](problems/1385/C/solution.c)                     | MSVC, GCC, or Clang          |
| C#         | [problems/1385/C#/Solution.cs](problems/1385/C%23/Solution.cs)               | .NET 10 SDK                  |
| C++        | [problems/1385/C++/solution.hpp](problems/1385/C++/solution.hpp)             | MSVC, G++, or Clang++        |
| Java       | [problems/1385/Java/Solution.java](problems/1385/Java/Solution.java)         | JDK (javac and java)         |
| Python 3   | [problems/1385/Python/solution.py](problems/1385/Python/solution.py)         | Python 3 (py or python)      |
| Rust       | [problems/1385/Rust/solution.rs](problems/1385/Rust/solution.rs)             | Rust stable and Cargo        |
| TypeScript | [problems/1385/TypeScript/solution.ts](problems/1385/TypeScript/solution.ts) | Node.js and local TypeScript |

Save your solution, then run from the repository root:

```powershell
npm start
```

Search for a problem by number or title, choose a language, and the launcher
compiles and runs its examples. Use arrow keys and Enter to select; Ctrl+C
cancels. Only languages with complete starter/runner files are offered. Toolchain
labels indicate requirements, not whether those tools are installed.

After a run, choose to rerun, select another problem/language, or exit. The
session returns the last run's exit code. New numeric folders inside `problems/` appear
automatically the next time you start the menu.

Each interactive run prints a reusable command. To skip the menu, pass the
problem number and language after npm's `--` separator:

```powershell
npm start -- 1385 "C#"
npm start -- 1385 TypeScript
npm start -- 1385 Python3
npm start -- 1385 Rust
npm start -- --help
```

Direct commands run once and return the runner's exit code without asking what
to do next. Provide both arguments; language names are case-insensitive. Use
`C`, `C#`, `C++`, `Java`, `Python` (or `Python3`), `Rust`, or `TypeScript`.

The VS Code tasks still work: press **Ctrl+Shift+B** to run the active language's examples.
From a problem's description, use **Terminal > Run Task > LeetCode: Run selected
language**. Tasks use the active file to determine the problem folder; keep a
problem file active rather than this README. These are run tasks, not debugger
configurations or the Code Runner extension's Run Code command.

Untouched starters intentionally fail every example. Passing examples produce
exit code 0; mismatches or unimplemented methods produce a nonzero exit code.
Add more cases to each language's main/Program file as needed. Example checks
are not a substitute for LeetCode's hidden tests.

For submissions, copy only the solution, not the runner. C submissions omit
the local solution.h include; TypeScript submissions omit `export`. Rust
submissions copy only the `impl Solution` block, not the local `pub struct
Solution` declaration or runner. LeetCode
provides the usual imports/includes for its starter interfaces.

## Debug TypeScript

1. Open and save a `.ts` file directly inside the problem's `TypeScript` folder.
2. Set a breakpoint on an executable line in the solution.
3. In Run and Debug (**Ctrl+Shift+D**), select **LeetCode: Debug active TypeScript
   problem**, then press **F5**. Select this configuration once if VS Code was
   previously launching the npm menu script.

F5 rebuilds the active problem with source maps and debugs its example runner,
not the interactive npm menu. Keep the TypeScript file active when starting;
the build task uses its containing folder. Failed examples do not block launch.
Other languages are not covered by this debug configuration.

Use **F10** to step over, **F11** to step into, and **F5** to continue. Hover over
variables or inspect them in Run and Debug while paused. **Ctrl+F5** runs this
same configuration without debugging.

## Debug Python

1. Open a `.py` file directly inside the problem's `Python` folder and set a
   breakpoint in `solution.py`.
2. In Run and Debug (**Ctrl+Shift+D**), select **LeetCode: Debug active Python
   problem**, then press **F5**.

The configuration launches that folder's `main.py` with the folder as its
working directory, so the example runner imports `solution.py` as usual. No
build task is needed. Debugging uses the repository's `.venv` (see setup below),
matching the run task. The Microsoft Python and Python Debugger extensions must
be enabled. Choose this
configuration explicitly because F5 remembers the last language configuration.
Use **F10** to step over, **F11** to step into, and **F5** to continue.

## Debug Rust

1. Open a `.rs` file directly inside the problem's `Rust` folder and set a
   breakpoint in `solution.rs`.
2. Select **LeetCode: Debug active Rust problem** in Run and Debug, then press
   **F5**.

This builds the active problem with Cargo's unoptimized dev profile and full
debug symbols, then launches its example runner with CodeLLDB. Rust 1385 is
implemented and passes the three published examples. New Rust problems still
start unsolved. Use F10/F11 to step and F5 to continue, just as with the other
languages.

Rust is installed per user through rustup using the Windows MSVC toolchain,
which needs the existing Visual Studio C++ tools. The rust-analyzer and CodeLLDB
extensions provide editing and debugging. Restart VS Code after the initial
installation so extensions and the new Cargo PATH are picked up. The run script
can also find Cargo under `CARGO_HOME` or the standard user `.cargo` directory.

Each problem has a Cargo package, and the root workspace automatically includes
`problems/*/Rust`. Cargo.lock is shared and tracked at the repository root; no third-party
crates are required. Shared run/debug commands put build products under ignored
`.build/`; Cargo's default `target/` directory is ignored too.

## Debug C#

1. Open and save a `.cs` file directly inside the problem's `C#` folder.
2. Set a breakpoint on an executable line in the solution.
3. Open Run and Debug (**Ctrl+Shift+D**) and select **LeetCode: Debug active C#
   problem**, then press **F5**.

This builds the active folder's `Practice.csproj` in Debug mode with portable
symbols and launches its example runner. The Microsoft C# extension (also
installed with C# Dev Kit) and the project's .NET SDK are required.

F5 remembers the selected configuration; it does not automatically switch
between C# and TypeScript when you change files. Select the matching language
configuration and keep that problem's source file active before launching.
Use the same stepping keys described above. No solution code needs changing.

## Debug C, C++, And Java

Open the solution file, set a breakpoint on an executable line, and select the
matching Run and Debug configuration before pressing **F5**:

- **LeetCode: Debug active C problem**
- **LeetCode: Debug active C++ problem**
- **LeetCode: Debug active Java problem**

Each configuration builds the active problem before launching its example
runner. C/C++ use the installed Visual Studio C++ toolchain, Microsoft C/C++
extension, unoptimized native code, and PDB symbols. Java uses the JDK in
`.tools/jdk`, `javac -g` symbols, Red Hat Java support, and Microsoft's Debugger
for Java. Reload VS Code after first installing the Java extensions if needed.
Keep a source file in the corresponding language folder active when launching.

Problem 1385's C, C++, and Java solutions are implemented and use only the three
published examples, matching the other language runners. Other
new problems created by the setup skill still start unsolved.

The JDK is installed locally in ignored `.tools/jdk`; it does not change PATH.
On a fresh clone, extract a Windows x64 JDK there to use Java F5 debugging.
Run-only tasks also accept `JAVA_HOME` or Java tools on PATH when no local JDK
exists. Native F5 debugging uses MSVC even if GCC/Clang are on PATH; run-only
tasks support either compiler family.

## One-Time Setup

Install the toolchains you want and make them available on PATH, then restart
VS Code. PowerShell 7 (`pwsh`) is required for the shared runner. Native tasks
can load the Visual Studio C++ developer environment automatically, without a
Developer Command Prompt. Java requires a JDK, not just a JRE. Python must be
a real Python 3 installation, not only the Windows Store launcher alias.

Create a repository-local Python environment using a working interpreter:

```powershell
python -m venv .venv
```

If the default Python installation is broken but a working uv runtime is
registered with Python Install Manager, explicitly select that runtime instead:

```powershell
py -V:Astral/CPython3.15.2 -m venv .venv
```

Use the tag shown by `py list` for your installed version. Both Python debug
launches and run tasks use `.venv`; no activation is required. Run tasks fall
back to Python on PATH when `.venv` is absent, but debugging requires it.
The environment is ignored by Git. Do not delete its base Python installation:
a virtual environment still depends on that runtime's standard library.

For the interactive menu and TypeScript, run from the repository root:

```powershell
npm install
```

Node.js is required for `npm start`, and PowerShell 7 runs the chosen language
behind the scenes. No global TypeScript installation or testing framework is needed. Dependencies
are shared across problems. Compilation output goes to ignored `.build/`;
.NET uses its standard ignored `bin/` and `obj/` folders.

For scripting, the underlying runner is still available:

```powershell
./scripts/run.ps1 -Problem 1385 -Language 'C#'
./scripts/run.ps1 -Problem 1385 -Language TypeScript
npm run typecheck -- problems/1385/TypeScript/tsconfig.json
```