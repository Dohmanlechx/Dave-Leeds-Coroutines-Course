---
title: "Structured Concurrency in Practice"
sidebar_position: 4
module: "Structured Concurrency 1"
---

# Structured Concurrency in Practice

## Key Takeaways

- You can build desktop apps (Windows/macOS/Linux) with Compose Multiplatform... cool, wasn't aware.
- Not really a takeaway but a good reminder: you gotta be very careful when working with UI threads; the slightest jank quickly harms the user experience.
- Ktor's HTTP client engine has a dispatcher configuration, and by default it uses `Dispatchers.IO`.

## General Notes

In this lesson, he went through a simple Book Tracker app with coroutines written in a way we have already learned so far. In the subsequent lessons, he will split up the coroutines as he talks through new concepts. So there weren't a lot of relevant learning notes to add here.

