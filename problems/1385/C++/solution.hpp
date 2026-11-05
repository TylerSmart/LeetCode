#ifndef SOLUTION_HPP
#define SOLUTION_HPP

#include <cstdlib>
#include <vector>

class Solution {
public:
    int findTheDistanceValue(std::vector<int>& arr1, std::vector<int>& arr2, int d) {
        int count = 0;
        for (int firstValue : arr1) {
            bool qualifies = true;
            for (int secondValue : arr2) {
                if (std::abs(firstValue - secondValue) <= d) {
                    qualifies = false;
                    break;
                }
            }
            if (qualifies) ++count;
        }
        return count;
    }
};

#endif