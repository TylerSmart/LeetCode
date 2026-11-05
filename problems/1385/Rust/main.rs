mod solution;

use solution::Solution;
use std::panic;

fn main() {
    let cases = [
        (vec![4, 5, 8], vec![10, 9, 1, 8], 2, 2),
        (vec![1, 4, 2, 3], vec![-4, -3, 6, 10, 20, 30], 3, 2),
        (vec![2, 1, 100, 3], vec![-5, -2, 10, -3, 7], 6, 1),
    ];
    let mut failures = 0;
    panic::set_hook(Box::new(|_| {}));
    for (index, (arr1, arr2, distance, expected)) in cases.into_iter().enumerate() {
        match panic::catch_unwind(|| Solution::find_the_distance_value(arr1, arr2, distance)) {
            Ok(actual) => {
                let passed = actual == expected;
                println!(
                    "Example {}: {} (expected {}, got {})",
                    index + 1,
                    if passed { "PASS" } else { "FAIL" },
                    expected,
                    actual
                );
                if !passed {
                    failures += 1;
                }
            }
            Err(error) => {
                let message = error
                    .downcast_ref::<String>()
                    .map(String::as_str)
                    .or_else(|| error.downcast_ref::<&str>().copied())
                    .unwrap_or("Solution panicked");
                println!("Example {}: FAIL ({})", index + 1, message);
                failures += 1;
            }
        }
    }
    std::process::exit(if failures == 0 { 0 } else { 1 });
}
