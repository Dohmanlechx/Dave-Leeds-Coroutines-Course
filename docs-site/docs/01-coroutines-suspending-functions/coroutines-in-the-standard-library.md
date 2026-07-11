---
title: "Coroutines in the Standard Library"
sidebar_position: 3
module: "Coroutines and Suspending Functions"
---

# Coroutines in the Standard Library

## Key Takeaways

- `yield()` is a suspending function that gives the other coroutine a chance to run some of its code.
- `tailrec` keyword runs the recursive function as a loop to not hit stack overflow.
- [DeepRecursiveFunction](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-deep-recursive-function/) uses heap memory instead of the stack, enabling you to use deep recursion without hitting stack size limits. Under the hood, it suspends at each recursive call.

## Code Snippets & Gotchas

The `tailrec` (tail recursion) keyword prevents `StackOverflowError` during recursion by telling the Kotlin compiler to transform the recursive function into a standard while loop under the hood.

The recursive call must be the absolute last operation.
```kotlin
tailrec fun countDown(n: Int) {
    if (n <= 0) return
    countDown(n - 1) // Absolute last step = Optimized into a loop!
}
```

