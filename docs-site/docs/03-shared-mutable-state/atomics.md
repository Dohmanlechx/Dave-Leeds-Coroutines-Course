---
title: "Atomics"
sidebar_position: 5
module: "Shared Mutable State"
---

# Atomics

## Key Takeaways

- Instead of using `Long`, thread confinement or mutex locks, you could use `AtomicLong`, which is currently an experimental Kotlin feature as well.

## What I Still Don't Understand

- Dave didn't explain how `AtomicLong` worked internally. So, how can it prevent race conditions?

## Code Snippets & Gotchas

I looked it up myself, how atomics work internally. Roughly, it reads the current value, calculates, and reads the current value again before updating it. If the current value is still unchanged, update it.

**Definition from Gemini:**

At the physical hardware level, the CPU tells the memory controller:
1. "Look at this memory address."
2. "If it matches expectedValue, smash newValue into it immediately."
3. Do not let any other CPU core touch this memory address until I am completely finished.

```kotlin
// A conceptual look at what the CPU is doing inside a CAS loop
fun atomicUpdate(newValueComputation: (Long) -> Long) {
    while (true) {
        // 1. READ the current value (Snapshot)
        val expectedValue = this.value 
        
        // 2. CALCULATE the new value based on that snapshot
        val newValue = newValueComputation(expectedValue) 
        
        // 3. RECHECK AND UPDATE (The CAS Step)
        // The CPU checks: "Is the memory value STILL equal to expectedValue?"
        // IF YES: It writes newValue and returns true instantly.
        // IF NO: Someone beat us to it! It returns false, and we loop back to Step 1.
        if (compareAndSet(expectedValue, newValue)) {
            return 
        }
    }
}
```

