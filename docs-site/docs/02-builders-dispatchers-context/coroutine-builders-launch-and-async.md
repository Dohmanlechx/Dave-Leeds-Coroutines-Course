---
title: "Coroutine Builders: launch() and async()"
sidebar_position: 2
module: "Builders, Dispatchers, and Context"
---

# Coroutine Builders: launch() and async()

## Key Takeaways

- `launch { }` is basically firing and forgetting.
- `async { }` purpose is producing some result.

## Code Snippets & Gotchas

It's crucial to understand WHEN the coroutines start. See this difference (say building a desk takes 3 seconds, and building a shelf takes 2 seconds):

### INCORRECT (well, suboptimal)
```kotlin
// Starts AND waits here immediately for 3 seconds. The next line is blocked.
val deskPrice = async { buildDesk() }.await()  
// Cannot start until the desk is completely finished. Waits another 2 seconds.
val shelfPrice = async { buildShelf() }.await() 

val totalSales = deskPrice + shelfPrice // Total time: 5 seconds
```

### CORRECT
```kotlin
// Both background tasks are triggered immediately one after another
val desk: Deferred<Desk> = async { buildDesk() }
val shelf: Deferred<Shelf> = async { buildShelf() }

// Execution pauses here to wait for the desk. 
// The shelf finishes entirely in the background during this wait.
val totalSales = desk.await().price + shelf.await().price // Total time: 3 seconds
```

