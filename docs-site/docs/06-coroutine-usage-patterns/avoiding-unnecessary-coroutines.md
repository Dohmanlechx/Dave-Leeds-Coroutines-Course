---
title: "Avoiding Unnecessary Coroutines"
sidebar_position: 1
module: "Coroutine Usage Patterns"
---

# Avoiding Unnecessary Coroutines

## Key Takeaways

- As the title already suggests: be careful not to wrap code in unnecessary coroutines, especially if you want to run the coroutines sequentially.
- Obvious examples of the above bullet point are `async` immediately followed by `await`, and `launch` immediately followed by `join`.
- This might sound ridiculous and incredibly obvious, but if there is no need for concurrency, there is no need for a coroutine.

## General Notes

This lesson went through some code and refactored away unnecessary coroutines. Indeed, a great one, because coroutines just aren't as complex as we might think they are. This will add to my code review mindset.

## Code Snippets & Gotchas

This lesson's exercise made me realize it is so easy to accidentally run the code sequentially instead of concurrently, because the code would still work, just slower.

