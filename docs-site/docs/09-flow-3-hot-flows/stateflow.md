---
title: "StateFlow"
sidebar_position: 3
module: "Flow 3: Hot Flows"
---

# StateFlow

## Key Takeaways

- The most visible difference between a `SharedFlow` and a `StateFlow` is that the second one requires an initial value. Besides that, the second one also distinguishes its values.
- `StateFlow` extends `SharedFlow`, which really makes sense.
- It's possible to get the `value` of a state flow from non-suspending code.

## General Notes

I recognize state flows from a couple of Android apps I worked on professionally. They used such flows for the UI states. They worked like a charm, and were very intuitive as well.

