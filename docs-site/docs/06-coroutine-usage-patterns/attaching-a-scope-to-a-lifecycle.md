---
title: "Attaching a Scope to a Lifecycle"
sidebar_position: 2
module: "Coroutine Usage Patterns"
---

# Attaching a Scope to a Lifecycle

## Key Takeaways

- `GlobalScope` is dangerous to use because it isn't attached to any lifecycle.

## What I Still Don't Understand

- This lesson introduced `synchronizedList` to demonstrate how `runBlocking` won't wait for all the nested jobs to finish because their scope isn't a child of `runBlocking`. I understand the idea, but it added some tough cognitive load for sure.

## General Notes

I already knew what a scope was. This lesson mostly illustrated how important it is to know when to cancel a job for a scope and so on, and also how dangerous `GlobalScope` is to use, because it isn't attached to any lifecycle.

