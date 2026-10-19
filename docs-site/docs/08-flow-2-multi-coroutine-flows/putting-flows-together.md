---
title: "Putting Flows Together"
sidebar_position: 3
module: "Flow 2: Multi-Coroutine Flows"
---

# Putting Flows Together

## Key Takeaways

- `scan` operator: similar to `fold`; see the section at the bottom.
- `zip` strictly pairs new values one-to-one and never reuses a value, whereas `combine` reuses the latest value from the other flow whenever either flow emits.
- `merge` does the same thing as `combine`, except it doesn't wait for the other value.

## General Notes

Okay, these three Flow operators (`merge`, `combine`, and `zip`) are ones to remember!

## Code Snippets & Gotchas

Difference between `fold` and `scan`:
```kotlin
val numbers = listOf(1, 2, 3, 4)

// fold: returns a single Int
val finalSum: Int = numbers.fold(0) { acc, num -> acc + num }
println(finalSum) // Output: 10

// scan: returns a List<Int> (size = 4 + 1 = 5)
val runningSum: List<Int> = numbers.scan(0) { acc, num -> acc + num }
println(runningSum) // Output: [0, 1, 3, 6, 10]
```

