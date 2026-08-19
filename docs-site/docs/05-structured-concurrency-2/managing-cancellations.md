---
title: "Managing Cancellations"
sidebar_position: 2
module: "Structured Concurrency 2"
---

# Managing Cancellations

## Key Takeaways

- Cancellations are polite. When `cancel()` is called, the coroutine isn't canceled abruptly. It's up to the coroutine how to close any resources it was using. This is known as ***Cooperative Cancellation***.
- `ensureActive()` throws `CancellationException` if the scope is no longer active. Since cancellations are polite, this method is handy to bail out a coroutine that has been canceled.
- `CancellationException` is a subtype of `IllegalStateException`, `RuntimeException`, `Exception`, and `Throwable`.
- `delay()` takes cancellations into consideration! When the method is called, it checks if the coroutine has been canceled as well, and aborts it in that case (throws `CancellationException`).

## What I Still Don't Understand

- Why the Kotlin team chose to extend `CancellationException` from `IllegalStateException`. Why is it an "illegal state" if it is just a coroutine that got canceled?

## General Notes

Regarding the takeaway above about exception subtypes, I can recognize it from some production code we have been working on - we had to catch `CancellationException` and then do nothing to swallow the specific error. Since it would be expected for the coroutine to be canceled.

## Code Snippets & Gotchas

Without `ensureActive()`:
```kotlin
val job = launch(Dispatchers.Default) {
    for (i in 1..1_000_000) {
        // Heavy computation without any suspending calls
        doHeavyMath(i) 
    }
}

delay(100)
job.cancel() // The loop keeps running until completion despite being cancelled!
```

With `ensureActive()`:
```kotlin
val job = launch(Dispatchers.Default) {
    for (i in 1..1_000_000) {
        ensureActive() // Throws CancellationException immediately if job.cancel() was called
        doHeavyMath(i)
    }
}

delay(100)
job.cancel() // Terminates immediately on the next iteration
```

