---
title: "Exceptions in Coroutines"
sidebar_position: 3
module: "Structured Concurrency 2"
---

# Exceptions in Coroutines

## Key Takeaways

- try/catch has no effect on `launch` and limited effect on `async`. It does not catch an exception thrown _within_ the coroutine.
- When an exception is not caught in a coroutine, then [Coroutine Exception Protocol](https://kotlinlang.org/docs/exception-handling.html) will pass up the exception all the way to the root coroutine.

## General Notes

**When an exception is thrown:**
- If the coroutine has any children, they will be cancelled.
- The coroutine finishes.
- The exception is handed up to the parent.
- All steps are repeated until every coroutine in the hierarchy has been cancelled.

_Important note: Here, the exception was never thrown, but handed up!_

