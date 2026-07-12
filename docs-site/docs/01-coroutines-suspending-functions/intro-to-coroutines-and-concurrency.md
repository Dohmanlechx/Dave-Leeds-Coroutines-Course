---
title: "Intro to Coroutines and Concurrency"
sidebar_position: 1
module: "Coroutines and Suspending Functions"
---

# Intro to Coroutines and Concurrency

## Key Takeaways

- [suspendCoroutineUninterceptedOrReturn](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.intrinsics/suspend-coroutine-unintercepted-or-return.html) is the "final checkpoint" of a suspending fuction.
- Every time you see the word `suspend` in Kotlin, you are looking at a function that has the potential to return `COROUTINE_SUSPENDED`.
- `Thread.sleep()` versus `delay()`: the first one blocks execution, the second one suspends the coroutine, allowing another coroutine to run.
- `withContext()` allows us to switch the dispatcher of a coroutine.
- Fun fact about Android: it throws [NetworkOnMainThreadException](https://developer.android.com/reference/android/os/NetworkOnMainThreadException) if you attempt to make a network request from the main thread.
- By default, an uncaught exception inside a coroutine will affect all of the coroutines within its scope.
- A core characteristic of a coroutine is the ability to pause and resume execution.

## What I Still Don't Understand

- Technical implementation of `COROUTINE_SUSPENDED`, like exactly when it might be returned.
- Coroutine builders.
- Technical differences between Default and IO dispatchers.

## General Notes

In a suspending function, it might not be able to return the value immediately, as it isn't available yet. When this happens, it returns `COROUTINE_SUSPENDED`. This is basically how coroutines work deep down.

I was wondering how it would "know" which coroutine to pass the baton to, like "it's your turn now", so I looked it up: there is a Dispatcher with a queue of tasks. `yield()` doesn't target a specific coroutine. It just tells the Dispatcher queue, "Put me at the end of the line, and wake up whoever has been waiting the longest!".

Concurrency vs. Parallelism - the only way to run coroutines in parallel (simultaneously) is to run them on separate threads.

## Code Snippets & Gotchas

As stated in the first bullet point - `suspendCoroutineUninterceptedOrReturn` is the "final checkpoint" of a suspending function. Illustrating diagram:
```
                  [ suspendCoroutineUninterceptedOrReturn ]
                                     |
                  Does the data arrive immediately?
                     /                       \
                  (YES)                     (NO)
                   /                           \
       Return the value directly.       Return COROUTINE_SUSPENDED.
     (No actual suspension happens!)    (The coroutine completely pauses
                                         and yields its thread right here!)
```

---
As stated, `yield()` gives the other coroutine a chance to run some code. My own little example - a kettle and a toaster taking turns:

```kotlin
fun main() {
    runBlocking {
        launch {
            println("Kettle: start heating")
            yield()
            println("Kettle: whistling!")
            yield()
        }
        println("Toaster: bread in")
        yield()
        println("Toaster: pop!")
        yield()
        println("Toaster: buttered")
    }
}
```

Output:
```
Toaster: bread in
Kettle: start heating
Toaster: pop!
Kettle: whistling!
Toaster: buttered
```

Notice that `Toaster: bread in` prints *before* `Kettle: start heating`, even though `launch` is written first - the code after `launch` keeps running until it hits `yield()`. Without the `yield()` calls, the code outside the `launch` block would run to completion first.

---
`async { }` gives us `Deferred`, which is a subtype of `Job`, and `Deferred` has this method `await()`, which gives us whatever object we try to return.

```kotlin
val user = async { fetchUser() }   // starts the work, returns a Deferred immediately
// ... the caller keeps running here ...
val result = user.await()          // suspends the caller until fetchUser() finishes
```

---
Concurrency vs Parallelism - my own sketch of the difference:

```text
Concurrency (one thread, tasks interleaved over time):
  Thread 1:  [A]-[B]-[A]-[B]-[A]->   one worker switching back and forth

Parallelism (two threads, at the same instant):
  Thread 1:  [A]---[A]---[A]->       two workers,
  Thread 2:  [B]---[B]--->           genuinely at once
```

---
This is a representation of a coroutine, basically. When a task is paused, the task is added to the end of the queue, and so on. My own mental model of that scheduling loop (not the real coroutine internals):

```kotlin
val queue = ArrayDeque<Task>()   // tasks waiting for a turn

while (queue.isNotEmpty()) {
    val task = queue.removeFirst()   // take the one at the front
    task.resume()                    // run it until it pauses or finishes
    if (task.isPaused) {
        queue.addLast(task)          // paused → send it to the back of the line
    }
}
```

