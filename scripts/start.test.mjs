import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { autocomplete, select } from "@clack/prompts";
import {
  discoverProblems,
  runSolution,
  start,
  parseArguments,
  directCommand,
} from "./start.mjs";

async function fixture(context) {
  const root = await mkdtemp(join(tmpdir(), "leetcode-menu-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "problems", "1385", "Python"), { recursive: true });
  await writeFile(
    join(root, "problems", "1385", "DESCRIPTION.md"),
    "# 1385. Distance Value\n",
  );
  await writeFile(join(root, "problems", "1385", "Python", "solution.py"), "");
  await writeFile(join(root, "problems", "1385", "Python", "main.py"), "");
  return root;
}

function menu(answers) {
  const messages = [];
  const prompt = async (options) => {
    assert(answers.length, "Unexpected extra prompt");
    const answer = answers.shift();
    if (typeof answer !== "symbol")
      assert(options.options.some((option) => option.value === answer));
    return answer;
  };
  const record = (message) => messages.push(message);
  return {
    messages,
    intro: record,
    outro: record,
    cancel: record,
    autocomplete: prompt,
    select: prompt,
    isCancel: (value) => typeof value === "symbol",
    log: { warn: record, step: record, error: record, success: record },
  };
}

test("discovers numeric problems and only complete language scaffolds", async (context) => {
  const root = await fixture(context);
  await mkdir(join(root, "problems", "2", "C"), { recursive: true });
  await writeFile(
    join(root, "problems", "2", "DESCRIPTION.md"),
    "2. Add Two Numbers\n",
  );
  await writeFile(join(root, "problems", "2", "C", "solution.c"), "");
  await mkdir(join(root, "node_modules"));
  await mkdir(join(root, "999"));
  await mkdir(join(root, "problems", "notes"));
  const problems = await discoverProblems(root);
  assert.deepEqual(
    problems.map((problem) => problem.value),
    ["2", "1385"],
  );
  assert.equal(problems[0].label, "2. Add Two Numbers");
  assert.equal(problems[0].languages.length, 0);
  assert.equal(problems[1].label, "1385. Distance Value");
  assert.deepEqual(
    problems[1].languages.map((language) => language.value),
    ["Python"],
  );
});

test("missing problems directory is treated as an empty collection", async (context) => {
  const root = await fixture(context);
  await rm(join(root, "problems"), { recursive: true });
  assert.deepEqual(await discoverProblems(root), []);
  const prompts = menu([]);
  assert.equal(await start({ root, prompts, interactive: true }), 0);
  assert(
    prompts.messages.some((message) =>
      message.includes("problems/<number>/DESCRIPTION.md"),
    ),
  );
});

test("reruns and changes selections while returning the latest exit code", async (context) => {
  const root = await fixture(context);
  const prompts = menu([
    "1385",
    "Python",
    "rerun",
    "choose",
    "1385",
    "Python",
    "exit",
  ]);
  let runs = 0;
  const code = await start({
    root,
    prompts,
    interactive: true,
    run: async (actualRoot, problem, language) => {
      assert.equal(actualRoot, root);
      assert.equal(problem, "1385");
      assert.equal(language, "Python");
      return ++runs === 3 ? 0 : 1;
    },
  });
  assert.equal(runs, 3);
  assert.equal(code, 0);
  assert(
    prompts.messages.some((message) => message.startsWith("Examples passed")),
  );
  assert(prompts.messages.includes('Next time: npm start -- 1385 "Python"'));
});

test("parses all language names and formats reusable commands", () => {
  assert.equal(parseArguments([]), undefined);
  assert.deepEqual(parseArguments(["--help"]), { help: true });
  for (const [input, expected] of [
    ["c", "C"],
    ["C#", "C#"],
    ["c++", "C++"],
    ["JAVA", "Java"],
    ["python", "Python"],
    ["Python3", "Python"],
    ["Python 3", "Python"],
    ["rust", "Rust"],
    ["typescript", "TypeScript"],
  ]) {
    assert.deepEqual(parseArguments(["1385", input]), {
      problem: "1385",
      language: expected,
    });
    assert.equal(
      directCommand("1385", expected),
      `npm start -- 1385 "${expected}"`,
    );
  }
  for (const args of [
    ["1385"],
    ["1385", "C", "extra"],
    ["../1385", "C"],
    ["1385", "Ruby"],
  ])
    assert.throws(() => parseArguments(args), /Usage:/);
});

test("direct arguments run once without a TTY or any menu prompts", async (context) => {
  const root = await fixture(context);
  for (const exitCode of [0, 1, 7]) {
    let runs = 0;
    const code = await start({
      root,
      args: ["1385", "Python3"],
      interactive: false,
      prompts: menu([]),
      output: () => {},
      run: async (actualRoot, problem, language) => {
        assert.equal(actualRoot, root);
        assert.equal(problem, "1385");
        assert.equal(language, "Python");
        runs++;
        return exitCode;
      },
    });
    assert.equal(code, exitCode);
    assert.equal(runs, 1);
  }
});

test("discovers complete Rust scaffolds and routes direct Rust runs", async (context) => {
  const root = await fixture(context);
  const folder = join(root, "problems", "1385", "Rust");
  await mkdir(folder);
  await writeFile(join(folder, "solution.rs"), "");
  await writeFile(join(folder, "main.rs"), "");
  let problems = await discoverProblems(root);
  assert.deepEqual(
    problems[0].languages.map((item) => item.value),
    ["Python"],
  );
  await writeFile(join(folder, "Cargo.toml"), "");
  problems = await discoverProblems(root);
  assert.deepEqual(
    problems[0].languages.map((item) => item.value),
    ["Python", "Rust"],
  );
  let runs = 0;
  assert.equal(
    await start({
      root,
      args: ["1385", "rUsT"],
      interactive: false,
      output: () => {},
      prompts: menu([]),
      run: async (actualRoot, problem, language) => {
        assert.equal(actualRoot, root);
        assert.equal(problem, "1385");
        assert.equal(language, "Rust");
        runs++;
        return 1;
      },
    }),
    1,
  );
  assert.equal(runs, 1);
});

test("invalid direct selections fail before execution and help needs no TTY", async (context) => {
  const root = await fixture(context);
  const run = () => assert.fail("Invalid selection must not run");
  for (const [args, expected] of [
    [["999", "Python"], /not found/],
    [["1385", "C#"], /not ready.*leetcode-setup/],
    [["1385", "Ruby"], /Unknown language/],
    [["1385"], /Usage:/],
  ])
    await assert.rejects(
      start({ root, args, run, interactive: false }),
      expected,
    );
  let help;
  assert.equal(
    await start({
      args: ["--help"],
      interactive: false,
      output: (text) => {
        help = text;
      },
    }),
    0,
  );
  assert(help.includes('npm start -- 1385 "C#"'));
  await assert.rejects(
    start({
      root,
      args: ["1385", "Python"],
      interactive: false,
      output: () => {},
      run: async () => {
        throw new Error("Missing tool");
      },
    }),
    /Missing tool/,
  );
});

test("cancellation at each selection never starts an unwanted run", async (context) => {
  const root = await fixture(context);
  for (const [answers, expectedRuns] of [
    [[Symbol()], 0],
    [["1385", Symbol()], 0],
    [["1385", "Python", Symbol()], 1],
  ]) {
    let runs = 0;
    const code = await start({
      root,
      prompts: menu(answers),
      interactive: true,
      run: async () => {
        runs++;
        return 1;
      },
    });
    assert.equal(runs, expectedRuns);
    assert.equal(code, expectedRuns ? 1 : 0);
  }
});

test("empty repositories and unscaffolded problems give setup guidance", async (context) => {
  const root = await fixture(context);
  await mkdir(join(root, "problems", "2"));
  const prompts = menu(["2", Symbol()]);
  assert.equal(await start({ root, prompts, interactive: true }), 0);
  assert(
    prompts.messages.some((message) => message.includes("/leetcode-setup 2")),
  );
  await rm(join(root, "problems", "2"), { recursive: true });
  await rm(join(root, "problems", "1385"), { recursive: true });
  assert.equal(await start({ root, prompts: menu([]), interactive: true }), 0);
});

test("rejects non-interactive terminals with an actionable message", async () => {
  await assert.rejects(
    start({ interactive: false }),
    /interactive terminal.*npm start/,
  );
});

test("uses argument arrays and forwards subprocess failures and missing pwsh", async () => {
  const launch = (command, args, options) => {
    assert.equal(command, "pwsh");
    assert.deepEqual(args.slice(-4), ["-Problem", "1385", "-Language", "C#"]);
    assert.equal(options.shell, false);
    assert.equal(options.stdio, "inherit");
    const child = new EventEmitter();
    queueMicrotask(() => child.emit("close", 7, null));
    return child;
  };
  assert.equal(await runSolution("path with spaces", "1385", "C#", launch), 7);
  await assert.rejects(
    runSolution("root", "1385", "C#", () => {
      const child = new EventEmitter();
      queueMicrotask(() =>
        child.emit("error", Object.assign(new Error(), { code: "ENOENT" })),
      );
      return child;
    }),
    /PowerShell 7.*not found/,
  );
});

test("real menu renders and responds to search and arrow-key selections", async () => {
  for (const [prompt, options, keys, expected] of [
    [
      autocomplete,
      [
        { value: "2", label: "2. Add Two Numbers" },
        { value: "1385", label: "1385. Distance Value" },
      ],
      "1385\r",
      "1385",
    ],
    [
      select,
      [
        { value: "C", label: "C" },
        { value: "C#", label: "C#" },
      ],
      "\u001b[B\r",
      "C#",
    ],
  ]) {
    const input = new PassThrough();
    const output = new PassThrough();
    input.isTTY = true;
    input.setRawMode = () => {};
    output.isTTY = true;
    output.columns = 80;
    output.rows = 24;
    let rendered = "";
    output.on("data", (chunk) => {
      rendered += chunk;
    });
    const answer = prompt({
      message: "Choose for practice",
      options,
      input,
      output,
    });
    setImmediate(() => input.write(keys));
    assert.equal(await answer, expected);
    assert(rendered.includes("Choose for practice"));
    input.destroy();
    output.destroy();
  }
});
