import { readdir, readFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const languageFiles = [
  {
    value: "C",
    label: "C",
    files: ["solution.c", "main.c"],
    hint: "MSVC / GCC / Clang",
  },
  {
    value: "C#",
    label: "C#",
    files: ["Solution.cs", "Program.cs", "Practice.csproj"],
    hint: ".NET SDK",
  },
  {
    value: "C++",
    label: "C++",
    files: ["solution.hpp", "main.cpp"],
    hint: "MSVC / G++ / Clang++",
  },
  {
    value: "Java",
    label: "Java",
    files: ["Solution.java", "Main.java"],
    hint: "JDK",
  },
  {
    value: "Python",
    label: "Python 3",
    files: ["solution.py", "main.py"],
    hint: "Python 3",
  },
  {
    value: "Rust",
    label: "Rust",
    files: ["solution.rs", "main.rs", "Cargo.toml"],
    hint: "Rust / Cargo",
  },
  {
    value: "TypeScript",
    label: "TypeScript",
    files: ["solution.ts", "main.ts", "tsconfig.json"],
    hint: "Node.js / TypeScript",
  },
];

const usage = `Usage:
  npm start                         Open the interactive menu
  npm start -- <problem> <language>  Run once without prompts
  npm start -- --help               Show this help

Languages: C, C#, C++, Java, Python (or Python3), Rust, TypeScript
Example: npm start -- 1385 "C#"`;

export function parseArguments(args) {
  if (args.length === 0) return undefined;
  if (args.length === 1 && ["--help", "-h"].includes(args[0]))
    return { help: true };
  if (args.length !== 2) throw new Error(usage);
  const [problem, inputLanguage] = args;
  if (!/^\d+$/.test(problem))
    throw new Error(`Problem must be a numeric folder name.\n${usage}`);
  const normalized = inputLanguage.toLowerCase().replace(/\s/g, "");
  const language = languageFiles.find(
    (item) =>
      item.value.toLowerCase() === normalized ||
      item.label.toLowerCase().replace(/\s/g, "") === normalized,
  );
  if (!language)
    throw new Error(`Unknown language: ${inputLanguage}.\n${usage}`);
  return { problem, language: language.value };
}

export function directCommand(problem, language) {
  return `npm start -- ${problem} "${language}"`;
}

export async function discoverProblems(root = repositoryRoot) {
  const problemsRoot = join(root, "problems");
  let entries;
  try {
    entries = await readdir(problemsRoot, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const problems = [];
  for (const entry of entries.filter(
    (entry) => entry.isDirectory() && /^\d+$/.test(entry.name),
  )) {
    let title = "Untitled problem";
    try {
      const description = await readFile(
        join(problemsRoot, entry.name, "DESCRIPTION.md"),
        "utf8",
      );
      const firstLine = description.split(/\r?\n/).find((line) => line.trim());
      title =
        firstLine
          ?.replace(/^\s*#+\s*/, "")
          .replace(/^\d+\.\s*/, "")
          .trim() || title;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const languages = [];
    for (const language of languageFiles) {
      try {
        await Promise.all(
          language.files.map((file) =>
            access(join(problemsRoot, entry.name, language.value, file)),
          ),
        );
        languages.push(language);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    problems.push({
      value: entry.name,
      label: `${entry.name}. ${title}`,
      languages,
    });
  }
  return problems.sort((first, second) =>
    first.value.localeCompare(second.value, undefined, { numeric: true }),
  );
}

export function runSolution(root, problem, language, launch = spawn) {
  return new Promise((resolveRun, reject) => {
    const child = launch(
      "pwsh",
      [
        "-NoProfile",
        "-File",
        join(root, "scripts", "run.ps1"),
        "-Problem",
        problem,
        "-Language",
        language,
      ],
      { cwd: root, stdio: "inherit", shell: false },
    );
    child.once("error", (error) => {
      reject(
        new Error(
          error.code === "ENOENT"
            ? "PowerShell 7 (pwsh) was not found. Install it and restart your terminal."
            : error.message,
        ),
      );
    });
    child.once("close", (code, signal) =>
      resolveRun(code ?? (signal === "SIGINT" ? 130 : 1)),
    );
  });
}

export async function start({
  root = repositoryRoot,
  args = [],
  output = console.log,
  prompts,
  run = runSolution,
  interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY),
} = {}) {
  const selection = parseArguments(args);
  if (selection?.help) {
    output(usage);
    return 0;
  }
  if (selection) {
    const problems = await discoverProblems(root);
    const problem = problems.find((item) => item.value === selection.problem);
    if (!problem)
      throw new Error(
        `Problem ${selection.problem} was not found in this repository.`,
      );
    if (!problem.languages.some((item) => item.value === selection.language))
      throw new Error(
        `${selection.language} is not ready for problem ${problem.value}. Run /leetcode-setup ${problem.value} in Copilot Chat first.`,
      );
    output(`${problem.label} / ${selection.language}`);
    return await run(root, problem.value, selection.language);
  }
  if (!interactive)
    throw new Error(
      "Open an interactive terminal in VS Code and run npm start, or use npm start -- <problem> <language> to run without prompts.",
    );
  const { intro, outro, autocomplete, select, cancel, isCancel, log } =
    prompts ?? (await import("@clack/prompts"));
  intro("LeetCode Practice");
  const problems = await discoverProblems(root);
  if (problems.length === 0) {
    log.warn(
      "No problems found. Add problems/<number>/DESCRIPTION.md and run /leetcode-setup <number> in Copilot Chat.",
    );
    outro("Nothing to run yet.");
    return 0;
  }

  let lastCode = 0;
  let problem;
  let language;
  while (true) {
    if (!problem) {
      const problemId = await autocomplete({
        message: "Which problem?",
        placeholder: "Search by number or title",
        maxItems: 8,
        options: problems.map((item) => ({
          value: item.value,
          label: item.label,
          hint: item.languages.length
            ? `${item.languages.length} languages ready`
            : "Needs setup",
        })),
      });
      if (isCancel(problemId)) {
        cancel("Session closed.");
        return lastCode;
      }
      problem = problems.find((item) => item.value === problemId);
      if (!problem.languages.length) {
        log.warn(
          `No runnable language files. Run /leetcode-setup ${problem.value} in Copilot Chat first.`,
        );
        problem = undefined;
        continue;
      }
      language = await select({
        message: "Which language?",
        options: problem.languages.map(({ value, label, hint }) => ({
          value,
          label,
          hint,
        })),
      });
      if (isCancel(language)) {
        cancel("Session closed.");
        return lastCode;
      }
    }

    log.step(
      `${problem.label} / ${language === "Python" ? "Python 3" : language}`,
    );
    log.step(`Next time: ${directCommand(problem.value, language)}`);
    console.log();
    const startedAt = performance.now();
    try {
      lastCode = await run(root, problem.value, language);
    } catch (error) {
      log.error(error.message);
      lastCode = 1;
    }
    console.log();
    const elapsed = ((performance.now() - startedAt) / 1000).toFixed(1);
    if (lastCode === 0) log.success(`Examples passed (${elapsed}s).`);
    else
      log.warn(
        `Run exited with code ${lastCode} (${elapsed}s). See output above for failed examples or toolchain errors.`,
      );

    const next = await select({
      message: "What next?",
      options: [
        {
          value: "rerun",
          label: "Run again",
          hint: "Same problem and language",
        },
        { value: "choose", label: "Choose problem / language" },
        { value: "exit", label: "Exit" },
      ],
      initialValue: "exit",
    });
    if (isCancel(next)) {
      cancel("Session closed.");
      return lastCode;
    }
    if (next === "exit") {
      outro("Session complete.");
      return lastCode;
    }
    if (next === "choose") problem = undefined;
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    process.exitCode = await start({ args: process.argv.slice(2) });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
