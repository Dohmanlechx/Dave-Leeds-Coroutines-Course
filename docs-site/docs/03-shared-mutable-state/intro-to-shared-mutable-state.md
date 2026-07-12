---
title: "Intro to Shared Mutable State"
sidebar_position: 1
module: "Shared Mutable State"
---

# Intro to Shared Mutable State

## General Notes

This lesson demonstrated how a race condition could occur when updating a shared value while running coroutines on separate threads. Nothing astounding. One minor takeaway, though: you can pass a seed value into the `Random` object to reproduce the identical result every time. Handy for debugging!

