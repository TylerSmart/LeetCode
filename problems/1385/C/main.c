#include <stdio.h>
#include "solution.h"

static int check(int number, int* arr1, int arr1Size, int* arr2, int arr2Size, int d, int expected) {
    int actual = findTheDistanceValue(arr1, arr1Size, arr2, arr2Size, d);
    printf("Example %d: %s (expected %d, got %d)\n", number, actual == expected ? "PASS" : "FAIL", expected, actual);
    return actual != expected;
}

int main(void) {
    int first1[] = {4, 5, 8};
    int second1[] = {10, 9, 1, 8};
    int first2[] = {1, 4, 2, 3};
    int second2[] = {-4, -3, 6, 10, 20, 30};
    int first3[] = {2, 1, 100, 3};
    int second3[] = {-5, -2, 10, -3, 7};
    int failures = 0;
    failures += check(1, first1, 3, second1, 4, 2, 2);
    failures += check(2, first2, 4, second2, 6, 3, 2);
    failures += check(3, first3, 4, second3, 5, 6, 1);
    return failures ? 1 : 0;
}