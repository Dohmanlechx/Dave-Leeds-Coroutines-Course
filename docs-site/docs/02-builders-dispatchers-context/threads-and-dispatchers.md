---
title: "Threads and Dispatchers"
sidebar_position: 3
module: "Builders, Dispatchers, and Context"
---

# Threads and Dispatchers

## Key Takeaways

- The thing that tells a coroutine what thread it should run on is called a Dispatcher.
- A Dispatcher is not a thread itself, it is responsible for assigning the coroutine to a thread.

## What I Still Don't Understand

- How `Dispatchers.IO` can create that many threads "regardless".
- What a thread really is, and how it works.
- Argh... threading is difficult! I'll understand better soon enough...

## General Notes

I am having trouble understanding the thread pool difference between `Dispatchers.Default` and `Dispatchers.IO`, AI summarized it in a decent analogy (I am still not convinced, but this made it better):
> Think of `Dispatchers.Default` like a kitchen with 4 chefs (CPU cores) actively cooking. Adding 64 chefs to the same small kitchen causes chaos.
>
> Think of `Dispatchers.IO` like 64 delivery drivers. They just pick up a package, drive away, and wait at a customer's door. They aren't crowding the kitchen, so you can have dozens of them operating at the exact same time.

---

I asked AI about `Dispatchers.IO` threads:
>`Dispatchers.IO` can create 64 threads "regardless" of your CPU cores because:
>Threads are cheap software structures made of RAM, not hardware processors.
>The OS scheduler can juggle them effortlessly using time-slicing if they are active.
>IO threads spend most of their time asleep, meaning they don't fight for CPU time anyway.

