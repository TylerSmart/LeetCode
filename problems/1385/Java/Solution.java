class Solution {
    public int findTheDistanceValue(int[] arr1, int[] arr2, int d) {
        int count = 0;
        for (int firstValue : arr1) {
            boolean qualifies = true;
            for (int secondValue : arr2) {
                if (Math.abs(firstValue - secondValue) <= d) {
                    qualifies = false;
                    break;
                }
            }
            if (qualifies) count++;
        }
        return count;
    }
}