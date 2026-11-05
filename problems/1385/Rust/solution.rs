pub struct Solution;

impl Solution {
    pub fn find_the_distance_value(arr1: Vec<i32>, arr2: Vec<i32>, d: i32) -> i32 {
        arr1.into_iter()
            .filter(|&first_value| {
                arr2.iter()
                    .all(|&second_value| (first_value - second_value).abs() > d)
            })
            .count() as i32
    }
}
