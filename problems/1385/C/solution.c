#include "solution.h"
#include <stdlib.h>

int findTheDistanceValue(int* arr1, int arr1Size, int* arr2, int arr2Size, int d) {
    int count = 0;
    for (int firstIndex = 0; firstIndex < arr1Size; ++firstIndex) {
        int qualifies = 1;
        for (int secondIndex = 0; secondIndex < arr2Size; ++secondIndex) {
            if (abs(arr1[firstIndex] - arr2[secondIndex]) <= d) {
                qualifies = 0;
                break;
            }
        }
        count += qualifies;
    }
    return count;
}