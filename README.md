# LeetCode Practice

This repository is a local practice workspace for solving LeetCode problems in
C, C#, C++, Java, Python 3, Rust, and TypeScript. Each problem has its own
folder under `problems/`, with a solution and an example runner for each
language. The runners check the examples from the problem description; they are
not a replacement for LeetCode's hidden tests.

## Get Started

The shared runner and VS Code tasks are designed for Windows and require
PowerShell 7 (`pwsh`).

1. Install [Git](https://git-scm.com/downloads), [Node.js LTS](https://nodejs.org/),
   [PowerShell 7](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows),
   and [Visual Studio Code](https://code.visualstudio.com/).
2. Clone this repository and open its folder in VS Code:

   ```powershell
   git clone https://github.com/TylerSmart/LeetCode.git
   cd LeetCode
   code .
   ```

3. Install the shared JavaScript dependencies from the repository root:

   ```powershell
   npm ci
   ```

4. Install the toolchains for the languages you plan to use. You do not need
   every toolchain:

   | Language | Toolchain |
   | --- | --- |
   | C | [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/downloads/), GCC, or Clang |
   | C# | [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) |
   | C++ | [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/downloads/), G++, or Clang++ |
   | Java | A [JDK](https://adoptium.net/temurin/releases/) (`javac` and `java`) |
   | Python 3 | [Python 3](https://www.python.org/downloads/) |
   | Rust | [Rust](https://www.rust-lang.org/tools/install) with Cargo |
   | TypeScript | Node.js; TypeScript is installed by `npm ci` |

   The runner needs a C/C++ compiler to run those languages. VS Code's C and
   C++ debug configurations use MSVC. Rust's debug configuration uses the
   Visual Studio C++ tools. A normal run can use GCC or Clang instead.

5. To use Python's VS Code debug configuration, create the repository-local
   virtual environment and select it as the workspace interpreter:

   ```powershell
   python -m venv .venv
   ```

   In VS Code, run **Python: Select Interpreter** and choose `.venv`. The
   Python run task can use an installed Python on `PATH` if `.venv` is absent;
   Python debugging expects `.venv`.

## VS Code

Open the repository root as the VS Code workspace. The included `.vscode`
configuration provides **LeetCode: Run active language**, **LeetCode: Run
selected language**, and debug configurations for the languages with supported
debuggers. Keep a source file in the problem's language folder active when
running a task or starting a debug configuration.

- Press **Ctrl+Shift+B** to run the active language, or use **Terminal > Run
  Task > LeetCode: Run selected language**.
- To debug, open a solution file, set a breakpoint, select the matching
  **LeetCode: Debug active ... problem** configuration in **Run and Debug**
  (**Ctrl+Shift+D**), then press **F5**.
- Install the relevant VS Code extensions: [C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools),
  [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit),
  [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack),
  [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python),
  [Python Debugger](https://marketplace.visualstudio.com/items?itemName=ms-python.debugpy),
  [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer),
  and [CodeLLDB](https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb).
  TypeScript debugging uses VS Code's built-in JavaScript debugger.

Java's VS Code debug configuration expects a Windows JDK extracted to
`.tools/jdk`. For run tasks, Java can also be found through `JAVA_HOME` or
`PATH`. Rust debugging needs the Rust and C++ tools plus CodeLLDB. Debug
configurations may have different requirements from run tasks; install only
the toolchains and extensions for the languages you use.

## Run Problems

Start the interactive problem and language selector from the repository root:

```powershell
npm start
```

Search for a problem by number or title, select a language, and follow the
prompt to run, choose another selection, or exit. Only languages with the
expected solution and runner files are offered. Numeric folders under
`problems/` are discovered automatically.

To run once without the menu, pass a problem number and language:

```powershell
npm start -- 1234 "C#"
npm start -- 1234 TypeScript
npm start -- 1234 Python3
npm start -- --help
```

Supported names are `C`, `C#`, `C++`, `Java`, `Python` (or `Python3`), `Rust`,
and `TypeScript`. The language name is case-insensitive. The direct command
returns the runner's exit code: zero means all examples passed; a nonzero code
indicates a failed example or a build/toolchain error.

The shared PowerShell runner can also be called directly:

```powershell
./scripts/run.ps1 -Problem 1234 -Language 'C#'
./scripts/run.ps1 -Problem 1234 -Language TypeScript
```

For TypeScript, check a problem's TypeScript project with:

```powershell
npm run typecheck -- problems/1234/TypeScript/tsconfig.json
```

Run the launcher's tests from the repository root with:

```powershell
node --test scripts/start.test.mjs
```

## Add a Problem

1. Create `problems/<number>/DESCRIPTION.md` and add the problem title and
   description, including its examples and constraints.
2. In Copilot Chat, run `/leetcode-setup <number>` or ask it to use the
   `leetcode-setup` skill to scaffold that problem. The skill creates
   unsolved solution starters and example runners in the supported languages.
   Review its inferred method signature against the official LeetCode starter.
3. Implement your answer in the language's solution file, not its example
   runner. Rerun the examples with `npm start` or a direct command.

Problem folders use this layout:

```text
problems/<number>/
  DESCRIPTION.md
  C/solution.c
  C#/Solution.cs
  C++/solution.hpp
  Java/Solution.java
  Python/solution.py
  Rust/solution.rs
  TypeScript/solution.ts
```

Each language folder also has a runner file (`main.c`, `Program.cs`,
`main.cpp`, `Main.java`, `main.py`, `main.rs`, or `main.ts`) that exercises the
solution using the description's examples. Leave that test harness intact
unless you want to add more local cases. Copy only the solution code when
submitting to LeetCode; the local runner and any practice-only scaffolding are
not part of a submission.

The shared launcher discovers numbered folders and complete language
scaffolds automatically. There is no menu registration or per-problem runner
script to maintain.
