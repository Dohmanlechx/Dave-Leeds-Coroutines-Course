---
title: "You'll Need a Scope..."
sidebar_position: 1
module: "Builders, Dispatchers, and Context"
---

# You'll Need a Scope...

## Key Takeaways

- Scope is "a group of _related_ coroutines".
- `CoroutineScope` is used for a `runBlocking` function.
- Coroutine builders like `launch` and `async` can only be run within a scope.

## Code Snippets & Gotchas

```kotlin
fun main() = runBlocking {
    launch { foo() }
    println("main end")
}
```

Without `launch`, it would stop at `foo()` until its job ends. With `launch`, it starts the job "in the background" and `main end` is immediately printed out.

