---
title: "Structured Programming & Concurrency"
sidebar_position: 1
module: "Structured Concurrency 1"
---

# Structured Programming & Concurrency

## Key Takeaways

- The keyword `GOTO` could be used to jump to another line of code in very old programming languages.

## General Notes

This lesson started by showing what programming with unconstrained jumps looked like, using the keyword `GOTO`. While the concept was easy to understand, maintaining a program with such code was incredibly hard because you wouldn't know what would go in and come out of a function.

In 1968, the computer scientist Edsger Dijkstra wrote a letter, arguing that the intellectual ability of a programmer was incredibly limited. Therefore, we should make our programs as easy to understand as possible by matching the code structure directly to the execution structure. This letter revolutionized software engineering - the era of *Structured Programming* was born.

## Code Snippets & Gotchas

The exercise was pretty fun and eye-opening, even if it was easy. Imagine programming like this for a production app. The exercise was about converting this to Kotlin. (snippet was altered due to copyright reasons)

```qbasic
grandTotal = 0

print "--- Java Express Terminal ---"

OrderScreen:
    print "Select a beverage size:"
    print "1 - Small ($3)"
    print "2 - Medium ($4)"
    print "3 - Large ($5)"
    print "Enter selection (1, 2, or 3):"
    input selection

    ' Direct branching based on menu selection
    if selection = 1 then goto ChargeSmall
    if selection = 2 then goto ChargeMedium
    if selection = 3 then goto ChargeLarge
    goto InvalidSelection

ChargeSmall:
    grandTotal = grandTotal + 3
    goto DisplayTotal

ChargeMedium:
    grandTotal = grandTotal + 4
    goto DisplayTotal

ChargeLarge:
    grandTotal = grandTotal + 5
    goto DisplayTotal

InvalidSelection:
    print "Invalid choice. Please pick option 1, 2, or 3."
    goto OrderScreen

DisplayTotal:
    print "Current Order Balance: $"; grandTotal
    print "Add another drink to this order? (y/n)"
    input reply$
    
    if reply$ = "y" or reply$ = "Y" then goto OrderScreen

Checkout:
    print "=========================================="
    print "Amount Due: $"; grandTotal
    print "Order finalized. Enjoy your coffee!"
    end
```

