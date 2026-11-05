public class Solution
{
    public int FindTheDistanceValue(int[] arr1, int[] arr2, int d)
    {
        return arr1.Aggregate(0, (int count, int arr1Value) =>
        {
            if (arr2.All((int arr2Value) => {
                int distance = DistanceBetweenTwoNumbers(arr1Value, arr2Value);
                return distance > d;
            })) {
                count++;
            }

            return count;
        });
    }

    public int DistanceBetweenTwoNumbers(int num1, int num2) {
        return Math.Abs(num1 - num2);
    }
}