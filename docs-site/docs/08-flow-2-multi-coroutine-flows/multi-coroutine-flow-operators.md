---
title: "Multi-Coroutine Flow Operators"
sidebar_position: 2
module: "Flow 2: Multi-Coroutine Flows"
---

# Multi-Coroutine Flow Operators

## Key Takeaways

- An emitter has a buffer holding up to 64 values. So when it's full, the emitter is going to suspend.
- `conflate()` is the same as `buffer(0, BufferOverflow.DROP_OLDEST)`.
- The Flow API actually has a `debounce` operator!
- `buffer` can be used for splitting up a flow to run across multiple coroutines.
- The default `buffer` value can be set by system property, but it's better to set it per flow.

## General Notes

I can feel how crucial it's to learn such stuff as these - even if agentic coding does everything for you, this knowledge should still be useful. Optimizing the flows to only collect emissions that make sense prevents duplicate, stale emissions.

