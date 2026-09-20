---
title: "Flows, Collectors, and Emitters"
sidebar_position: 2
module: "Flow 1: Essentials"
---

# Flows, Collectors, and Emitters

## Key Takeaways

- The biggest difference between a `sequence` and a `flow` is that the terminal operator, for example `collect { }`, is a suspending function.
- Flows are not suspending functions, so they can be created in regular functions. However, they can only be collected within a suspending function.

## General Notes

Now we have started getting into real-life examples, such as using flows, so I believe my learning notes will be shorter from now on. Because it was mostly the internals I wanted to learn about while buying this course. But I can very well be wrong here, let's see...

