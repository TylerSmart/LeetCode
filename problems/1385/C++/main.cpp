#include <iostream>
#include "solution.hpp"

struct TestCase {
    std::vector<int> arr1;
    std::vector<int> arr2;
    int distance;
    int expected;
};

int main() {
    std::vector<TestCase> cases = {
        {{4, 5, 8}, {10, 9, 1, 8}, 2, 2},
        {{1, 4, 2, 3}, {-4, -3, 6, 10, 20, 30}, 3, 2},
        {{2, 1, 100, 3}, {-5, -2, 10, -3, 7}, 6, 1}
    };
    int failures = 0;
    for (std::size_t index = 0; index < cases.size(); ++index) {
        auto& test = cases[index];
        try {
            int actual = Solution().findTheDistanceValue(test.arr1, test.arr2, test.distance);
            bool passed = actual == test.expected;
            std::cout << "Example " << index + 1 << ": " << (passed ? "PASS" : "FAIL")
                      << " (expected " << test.expected << ", got " << actual << ")\n";
            if (!passed) ++failures;
        } catch (const std::exception& error) {
            std::cout << "Example " << index + 1 << ": FAIL (" << error.what() << ")\n";
            ++failures;
        }
    }
    return failures ? 1 : 0;
}