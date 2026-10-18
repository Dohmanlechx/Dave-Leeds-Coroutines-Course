---
title: "Intro to Multi-Coroutine Flows"
sidebar_position: 1
module: "Flow 2: Multi-Coroutine Flows"
---

# Intro to Multi-Coroutine Flows

## Key Takeaways

- The Flow API doesn't let us change the context around a call to `emit`.
- Things upstream can't change the context of things downstream.
- When we change the dispatcher to something different, the flow is split up into separate coroutines.

## General Notes

Kotlin has already created ready-to-use thread pools in the background (`Dispatchers.Default` and `Dispatchers.IO`, for example). When you call `flowOn`, you are essentially saying: "Launch a new coroutine for the code above, and run it on any available thread in that pool."

## Code Snippets & Gotchas

```kotlin
flow {
    // 1. Runs on Dispatchers.IO (affected by flowOn below)
    emit(fetchData()) 
}
.map { 
    // 2. ALSO runs on Dispatchers.IO (located above flowOn)
    transform(it) 
}
.flowOn(Dispatchers.IO) // <-- Boundary! Only changes UPSTREAM (1 & 2)
.filter { 
    // 3. Runs on Dispatchers.Main (located downstream of flowOn!)
    it.isValid 
}
.collect { 
    // 4. Runs on Dispatchers.Main (the context from here controls steps 3 & 4)
    updateUi(it) 
}
```

