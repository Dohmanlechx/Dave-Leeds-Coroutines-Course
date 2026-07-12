---
title: "Avoiding Shared Mutable State"
sidebar_position: 2
module: "Shared Mutable State"
---

# Avoiding Shared Mutable State

## General Notes

This lesson made the previous lesson more interesting - the race condition was introduced because the state value was updated within the coroutine instead of outside it, i.e., a "side effect". Often we can remove such side effects by separating the code that performs a calculation from the code that updates state. See code snippets below.

## Code Snippets & Gotchas

Race condition block - state being updated within a coroutine:
```kotlin
fun main() {
    var totalCandy = 0L

    runBlocking {
        for (bag in trickOrTreatBags()) {
            launch(Dispatchers.Default) { 
                totalCandy += countPieces(bag.size, bag.candyType) 
            }
        }
    }

    val finalCount = String.format("Grand total: %,d pieces", totalCandy)
    println(finalCount)
}
```

Updated code to prevent race condition - updating the state in the function body itself, outside the coroutine:
```kotlin
fun main() {
    val grandTotal = runBlocking {
        trickOrTreatBags()
            .map { singleBag -> 
                async(Dispatchers.Default) { 
                    countPieces(singleBag.size, singleBag.candyType) 
                } 
            }
            .sumOf { activeTask -> activeTask.await() }
    }

    val finalCount = String.format("Grand total: %,d pieces", grandTotal)
    println(finalCount)
}
```

