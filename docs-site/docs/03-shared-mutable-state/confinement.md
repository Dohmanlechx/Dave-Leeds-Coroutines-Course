---
title: "Confinement"
sidebar_position: 3
module: "Shared Mutable State"
---

# Confinement

## Key Takeaways

- Running "critical section" (setting shared value) code on a single thread is enough to prevent a race condition. This is called Thread Confinement.

## Code Snippets & Gotchas

When using `async { }`, you must be very careful not to stagger the execution by calling `await()` at the wrong time.

```kotlin
for (order in orders()) {
    val price = async(Dispatchers.Default) { calculatePrice(order.item, order.membership) }
    withContext(synchronized) { revenue += price.await() } // ⚠️ THE BRAKE PEDAL
}
```

This is much faster because execution isn't staggered at any point.

```kotlin
for (order in orders()) {
    launch(Dispatchers.Default) {
        val price = calculatePrice(order.item, order.membership) // Run in parallel!
        withContext(synchronized) { revenue += price } // Queue up sequentially
    }
}
```

