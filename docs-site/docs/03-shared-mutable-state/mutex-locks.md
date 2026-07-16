---
title: "Mutex Locks"
sidebar_position: 4
module: "Shared Mutable State"
---

# Mutex Locks

## Key Takeaways

- Mutex is short for Mutual Exclusion - only one can be true at one time.
- With `Mutex` you can synchronize without changing dispatchers.

## General Notes

Initially I understood it as `Mutex` makes sure the invoked code is being executed on the same thread, maybe like an intuitive alternative to hard-to-read `val synchronized = Dispatchers.Default.limitedParallelism(1)`, but in reality they solve the same problem (race condition) but in different ways.

`Mutex` does not necessarily make sure that invocations always run on the same thread; it could be run on different threads. What `Mutex` simply does is lock whatever is within it, update it, and release the lock so whatever is inside of it can be updated again.

## Code Snippets & Gotchas

`Mutex` implementation:
```kotlin
@OptIn(ExperimentalContracts::class)
public suspend inline fun <T> Mutex.withLock(owner: Any? = null, action: () -> T): T {
    contract {
        callsInPlace(action, InvocationKind.EXACTLY_ONCE)
    }
    lock(owner)
    return try {
        action()
    } finally {
        unlock(owner) // checks the waiting queue
    }
}
```

