---
title: "Passing Scopes and Dispatchers"
sidebar_position: 3
module: "Coroutine Usage Patterns"
---

# Passing Scopes and Dispatchers

## Key Takeaways

- Always aim to go for suspending functions rather than regular functions, wrapped by coroutine builders or so.

## General Notes

I looked into our state management framework, [Revolver](https://github.com/apegroup/revolver), and how they were passing the scope/dispatcher. The more I am into this course, the more I look into the Revolver codebase, the more I realize how lightweight it actually is.

## Code Snippets & Gotchas

Again, I made the same mistake in the exercise:
```kotlin
    val receipts = sampleOrders()
        .map { order -> checkoutAsync(this, order) }
```

Because that went through the orders sequentially rather than simultaneously:
```kotlin
    val receipts = sampleOrders()
        .map { order -> async { checkoutAsync(this, order) } }
        .awaitAll()
```

Just like in the gotcha section two lessons back. Need to really log stuff to see if you run stuff concurrently.

