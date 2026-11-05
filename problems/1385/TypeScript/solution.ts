export function findTheDistanceValue(
  arr1: number[],
  arr2: number[],
  d: number,
): number {
  return arr1.reduce((count, arr1Value) => {
    if (
      arr2.every((arr2Value) => {
        const distance = distanceBetweenTwoNumbers(arr1Value, arr2Value);
        return distance > d;
      })
    ) {
      count++;
    }

    return count;
  }, 0);
}

function distanceBetweenTwoNumbers(num1: number, num2: number): number {
  return Math.abs(num1 - num2);
}
