from solution import Solution


def main() -> int:
    cases = [
        ([4, 5, 8], [10, 9, 1, 8], 2, 2),
        ([1, 4, 2, 3], [-4, -3, 6, 10, 20, 30], 3, 2),
        ([2, 1, 100, 3], [-5, -2, 10, -3, 7], 6, 1),
    ]
    failures = 0
    for number, (arr1, arr2, distance, expected) in enumerate(cases, start=1):
        try:
            actual = Solution().findTheDistanceValue(arr1, arr2, distance)
            passed = actual == expected
            print(f"Example {number}: {'PASS' if passed else 'FAIL'} (expected {expected}, got {actual})")
            failures += not passed
        except Exception as error:
            print(f"Example {number}: FAIL ({type(error).__name__}: {error})")
            failures += 1
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())