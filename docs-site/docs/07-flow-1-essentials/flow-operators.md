---
title: "Flow Operators"
sidebar_position: 3
module: "Flow 1: Essentials"
---

# Flow Operators

## Key Takeaways

- `map` and `filter` aren't suspending functions, they just accept a suspending lambda.
- Flows indeed have many of the same operators that collections and sequences have.
- The term **upstream** describes a flow or operator that comes before a particular operator, and **downstream** describes those that come after.

## Code Snippets & Gotchas

Checked out the difference between `map` and `transform` operators for the flow - map must return exactly one item, while transform can return (actually emit) anything (one or many), even nothing. Under the hood, this is the implementation for `map` which is quite funny:
```kotlin
public inline fun <T, R> Flow<T>.map(crossinline transform: suspend (value: T) -> R): Flow<R> = transform { value ->
    return@transform emit(transform(value))
}
```

