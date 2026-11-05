class Solution:
    def findTheDistanceValue(self, arr1: list[int], arr2: list[int], d: int) -> int:
        return sum(
            1
            for arr1Value in arr1
            if all(self.distanceBetweenTwoNumbers(arr1Value, arr2Value) > d for arr2Value in arr2)
        )

    def distanceBetweenTwoNumbers(self, num1: int, num2: int) -> int:
        return abs(num1 - num2)