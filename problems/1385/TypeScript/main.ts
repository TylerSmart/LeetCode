import { findTheDistanceValue } from "./solution";

const cases = [
  { arr1: [4, 5, 8], arr2: [10, 9, 1, 8], d: 2, expected: 2 },
  { arr1: [1, 4, 2, 3], arr2: [-4, -3, 6, 10, 20, 30], d: 3, expected: 2 },
  { arr1: [2, 1, 100, 3], arr2: [-5, -2, 10, -3, 7], d: 6, expected: 1 },
];
let failures = 0;
for (const [index, test] of cases.entries()) {
  try {
    const actual = findTheDistanceValue(test.arr1, test.arr2, test.d);
    const passed = actual === test.expected;
    console.log(
      `Example ${index + 1}: ${passed ? "PASS" : "FAIL"} (expected ${test.expected}, got ${actual})`,
    );
    if (!passed) failures++;
  } catch (error) {
    console.log(
      `Example ${index + 1}: FAIL (${error instanceof Error ? error.message : String(error)})`,
    );
    failures++;
  }
}
process.exitCode = failures === 0 ? 0 : 1;
