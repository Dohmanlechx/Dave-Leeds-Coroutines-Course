---
title: "CoroutineExceptionHandler"
sidebar_position: 5
module: "Structured Concurrency 2"
---

# CoroutineExceptionHandler

## Key Takeaways

- You can create a [CoroutineExceptionHandler](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-exception-handler/), add logic in its lambda, and then pass it as a parameter to `launch`.
- The red error text in the output log comes from `Thread.UncaughtExceptionHandler`.

## General Notes

After this lesson, I immediately navigated to https://github.com/apegroup/revolver to see how they implemented all the error handlers. Everything made a lot of sense and this state management was much simpler than I imagined. Fun!

