public class Main {
    public static void main(String[] args) {
        int[][] first = {{4, 5, 8}, {1, 4, 2, 3}, {2, 1, 100, 3}};
        int[][] second = {{10, 9, 1, 8}, {-4, -3, 6, 10, 20, 30}, {-5, -2, 10, -3, 7}};
        int[] distances = {2, 3, 6};
        int[] expected = {2, 2, 1};
        int failures = 0;
        for (int index = 0; index < first.length; index++) {
            try {
                int actual = new Solution().findTheDistanceValue(first[index], second[index], distances[index]);
                boolean passed = actual == expected[index];
                System.out.printf("Example %d: %s (expected %d, got %d)%n", index + 1, passed ? "PASS" : "FAIL", expected[index], actual);
                if (!passed) failures++;
            } catch (Exception error) {
                System.out.printf("Example %d: FAIL (%s: %s)%n", index + 1, error.getClass().getSimpleName(), error.getMessage());
                failures++;
            }
        }
        System.exit(failures == 0 ? 0 : 1);
    }
}