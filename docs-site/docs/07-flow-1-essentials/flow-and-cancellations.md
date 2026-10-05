---
title: "Flow and Cancellations"
sidebar_position: 4
module: "Flow 1: Essentials"
---

# Flow and Cancellations

## What I Still Don't Understand

- Why is there even a `cancellable()` to make a flow cancellation-aware? Why is it not by default?

## General Notes

Basically the only learning from this lesson is to ensure a coroutine is cancellation-aware. We have had a lot of uncertainties (and a lot of discussions) about how to deal with cancelled coroutines in our production app at work.

## Code Snippets & Gotchas

I looked into my remark regarding `cancellable()`. The answer is that it adds overhead that checks whether the coroutine has been cancelled. But the most important thing is that only adapters like `asFlow()` (extensions) need it. By default, flows are cancellation-aware. When calling `cancellable()`, overhead is added roughly like this:

```kotlin
public fun <T> Flow<T>.cancellable(): Flow<T> =
    if (this is CancellableFlow) this
    else CancellableFlowImpl(this)

// Conceptually inside CancellableFlowImpl:
override suspend fun collect(collector: FlowCollector<T>) {
    flow.collect { value ->
        currentCoroutineContext().ensureActive() // <-- The injected overhead
        collector.emit(value)
    }
}
```

Calling `cancellable()` is optional for performance reasons.

