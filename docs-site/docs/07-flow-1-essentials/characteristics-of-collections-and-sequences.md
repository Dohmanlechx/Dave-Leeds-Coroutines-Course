---
title: "Characteristics of Collections and Sequences"
sidebar_position: 1
module: "Flow 1: Essentials"
---

# Characteristics of Collections and Sequences

## Key Takeaways

- Flows have a lot in common with collections and sequences.
- `sequence {}` is a builder function that allows us to generate values dynamically; I've actually never used it.
- The sequence builder is actually not allowed to call just any suspending function; it can only call members such as `yield()` and `yieldAll()`. Hence functions like these are said to have "restricted suspension".

## General Notes

This lesson probably demonstrated sequence because it has a lot in common with flows that we will go through in the subsequent lessions.

