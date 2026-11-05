var cases = new (int[] Arr1, int[] Arr2, int D, int Expected)[]
{
    (new[] { 4, 5, 8 }, new[] { 10, 9, 1, 8 }, 2, 2),
    (new[] { 1, 4, 2, 3 }, new[] { -4, -3, 6, 10, 20, 30 }, 3, 2),
    (new[] { 2, 1, 100, 3 }, new[] { -5, -2, 10, -3, 7 }, 6, 1)
};
var failures = 0;
for (var index = 0; index < cases.Length; index++)
{
    var test = cases[index];
    try
    {
        var actual = new Solution().FindTheDistanceValue(test.Arr1, test.Arr2, test.D);
        var passed = actual == test.Expected;
        Console.WriteLine($"Example {index + 1}: {(passed ? "PASS" : "FAIL")} (expected {test.Expected}, got {actual})");
        if (!passed) failures++;
    }
    catch (Exception error)
    {
        Console.WriteLine($"Example {index + 1}: FAIL ({error.GetType().Name}: {error.Message})");
        failures++;
    }
}
Environment.ExitCode = failures == 0 ? 0 : 1;