---
title: "Creating Structured Concurrency"
sidebar_position: 2
module: "Structured Concurrency 1"
---

# Creating Structured Concurrency

## Key Takeaways

- Running `GlobalScope` is no guarantee that the code will be executed before the program terminates.
- Wrapping the above code within a `runBlocking` wrapper and using its scope ensures the code is executed.
- `runBlocking` BLOCKS the main thread until it returns.
- `Job` implements the `CoroutineScope` interface.
- A `launch { }` wrapper always waits for its nested `launch { }` wrappers to finish.

## What I Still Don't Understand

- After all, I am still not perfectly convinced of _what_ coroutine builder I should use for a specific case.

## General Notes

This lesson was basically about hierarchy. A parent coroutine always waits for its children to finish before finishing.

