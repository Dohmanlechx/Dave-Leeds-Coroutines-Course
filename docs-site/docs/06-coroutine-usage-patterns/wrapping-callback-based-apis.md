---
title: "Wrapping Callback-Based APIs"
sidebar_position: 4
module: "Coroutine Usage Patterns"
---

# Wrapping Callback-Based APIs

## Key Takeaways

- `suspendCancellableCoroutine` is useful when wrapping a callback-based API to convert it to a coroutine-based API.

## What I Still Don't Understand

- How the wrapping would work if the callbacks use streams - will probably be covered later in this course.

## General Notes

Very useful lesson! Very much applicable in real-life production apps - where we often have to install third-party dependencies that are callback-based. Great exercise in wrapping them in coroutines.

## Code Snippets & Gotchas

From the exercise - how I wrapped the third-party API.

```kotlin
class PaymentSystemWrapper(val system: ThirdPartyPaymentSystem = ThirdPartyPaymentSystem()) {
    suspend fun payWithStoreCredit(
        customer: Customer,
        amountToCharge: Int,
    ): StoreCreditResult = suspendCancellableCoroutine { continuation ->
        system.payWithStoreCredit(customer, amountToCharge, object : StoreCreditCallback {
            override fun onApplied(balanceDue: Int) = continuation.resume(StoreCreditResult.OnApplied(balanceDue))
            override fun onNotFound() = continuation.resume(StoreCreditResult.NotFound)
        })
    }

    suspend fun payWithPaymentCard(
        customer: Customer,
        amountToCharge: Int,
    ): PaymentCardResult = suspendCancellableCoroutine { continuation ->
        system.payWithPaymentCard(customer, amountToCharge, object : PaymentCallback {
            override fun onApproved() = continuation.resume(PaymentCardResult.Approved)
            override fun onDeclined() = continuation.resume(PaymentCardResult.Declined)
            override fun onNotFound() = continuation.resume(PaymentCardResult.NotFound)
        })
    }
}
```

