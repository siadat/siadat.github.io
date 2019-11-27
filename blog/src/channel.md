---
title: "Go Grammar in Use"
subtitle: "A concise guide on how to read Go code"
date: 2018-03-04
draft: true
tags: go
---

# Reading

This is a random collection of tips on how to read idiomatic Go code.

## Channels

ch can hold 0 ints

    ch := make(chan int)

ch can hold 0 ints (same as above)

    ch := make(chan int, 0)

bufferedChan can hold up to n ints

    bufferedChan := make(chan int, n)

Close ch.
```notebox
- We cannot send to ch any longer<br>
- We can receive from ch and get 0s
```

    close(ch)

Close bufferedChan
```notebox
- We cannot send to bufferedChan any longer
- We can receive from ch and get whatever is in its buffer until the buffer is empty
```

    close(bufferedChan)

Receive value **from ch**

    value := <-ch

Send 5 **to ch**

    ch<-5

```notebox
Always read expressions with the channel operator (i.e., <-) relative to the channel itself.
```

Select a random ready case
If there are no ready cases, select default

    select {
      case a := <-ch:
        // ...
      case ch<-1:
        // ...
      default:
        // ...
    }


## Tests

A test function is named like a second-person imperative sentence (e.g., Test Func!)

    func TestFunc(t *testing.T)

A test file is named like a noun (e.g., user test)

    user_test.go

## Slice

Create a slice of length 10

    slice := make([]int, 10)

Create a slice of length 10, whose capacity (i.e., length of its underlying array) is 20.

```notebox
This means that if we append 10 more values to this slice, it will use the same underlying array to store all 20 values.
For the 21th value to be appened a new, larger underlying array will be created by the Go runtime.
```

    slice := make([]int, 10, 20)

## io.Copy

dst = src

    io.Copy(dst, src)

# WRITING GO CODE

## Context
    // 
    // Create a new context with all
    // 
    //     ctx, cancel := context.WithDeadline(ctx, time.Second)
    // 

## misc
    // 
    // create a random integer
    // 
    //     r := rand.Intn(1000)

## read file

## write file

## append a line to a file

