---
title: "Flattening Flows"
sidebar_position: 4
module: "Flow 2: Multi-Coroutine Flows"
---

# Flattening Flows

## General Notes

I knew what flattening was, so not much new from this lesson. In the exercise, I used three different operators and learned the difference in their strategy:

* `flatMapMerge`: emits everything immediately (concurrently) as inner flows produce values.
* `flatMapConcat`: emits everything from one inner flow first, before starting the next one.
* `flatMapLatest`: drops and cancels the current inner flow the instant a new upstream value arrives, switching entirely to the latest inner flow.

