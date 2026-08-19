---
title: "Cancellations"
sidebar_position: 1
module: "Structured Concurrency 2"
---

# Cancellations

## Key Takeaways

- When a coroutine is canceled, the children are canceled as well.

## General Notes

Naturally we need to cancel our coroutines: such as explicitly aborting a download, or if the user navigates to another screen and some work related to the previous screen needs to be aborted. You might want to abort heavy jobs when the battery level is low.

