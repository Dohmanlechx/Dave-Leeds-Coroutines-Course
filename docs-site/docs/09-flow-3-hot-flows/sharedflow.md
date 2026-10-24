---
title: "SharedFlow"
sidebar_position: 2
module: "Flow 3: Hot Flows"
---

# SharedFlow

## Key Takeaways

- A `SharedFlow` can be cast to a `MutableSharedFlow` and therefore be hijacked with multiple emitters. This can be prevented by using `asSharedFlow()`.
- Hot flow collectors will run forever unless you cancel them.
- Because `SharedFlow` halts upstream emission until all subscribers finish consuming each value, one sluggish collector will end up blocking everyone else.
- Avoid collector bottlenecks by setting buffer size (`extraBufferCapacity` or `replay`) and handling full buffers via `onBufferOverflow` using standard `buffer()` overflow policies.

## Code Snippets & Gotchas

This lesson's exercise was a tricky one; I wondered why I never got some values logged, until I realized I started the emission before attaching any collector. Hence the concept of hot flows. Well done, Dave sir.

