---
title: Recursion vocabulary
date: 2020-01-22
draft: false
---

[call_stack]: https://en.wikipedia.org/wiki/Call_stack

## Abstract

In this post, I write that the existing terminology for [call stacks][call_stack]
is not enough, and we need new words for thinking about
recursive call stacks, and I consider a couple of possible words
that are suited for reading and reasoning about functions,
namely "upstream" (closer to initial caller) and "downstream" (closer to the
top of the call stack).
However, they are not perfect as they do not match perfectly with the call stack terminology.

## Problem

In a normal call stack, data flows
in several directions:

- from the function that called us
- back to the function that called us
- to one or more functions we call
- from one of more functions we call

Hence, data flows in 4 different channels via arguments and return values.
As a special case, recursive functions are even more complex
because they share the same signatures and variable names
with the functions they are communicating with.

## Solution 1: "caller" and "called" functions

We could refer to the function we are calling as the "called function."
But this does not distinguish that function from any other called function in the program.
A more appropriate albeit long phrase would be "the function we call."
And we could refer to the function that called us as "the function that called us."

## Solution 2: stack "push" and "pop"

We could refer to the function we are calling as being "pushed on top of the stack"
and when it returns it will be "popped from the top of the stack."

The vocabulary used to describe call stacks is motivated by the details of how memory is managed.
The focus of this post is to find a way to describe the logical and algorithmic
flow of communication, as opposed to call stacks and implementation details.

## Solution 3: "upstream" and "downstream"

I think it would be a good idea to have a couple of new names to differentiate the direction of flows
between function calls.
We could think of a caller functions as logically **upstream** to the function it calls,
and the called functions as logically **downstream** to its caller.
So, when a function calls another function (or itself), we are momentarily going downstream,
until that function returns and we are back.

When reading a function, we are focused on teh current stack,
and the functions we call are hiding complexity behind an invocation.
That's why I think the called functions go "down" or somewhere less important that the 
current function's scope, and that I don't want to think of them as coming "up"
and get closer to my face (as seems to be the case in call stack terminology).

The problem is that these flows are not exactly "streams".
We are sending data down and up, but not in a continuous way.
Perhaps "send down" and "send up", or "bubble up" and "sink down" would be better alternatives.
At least temporarily, I am going to stick with "upstream" and "downstream" for the rest of this post,
because it sounds natural to use them as adjectives for functions, we can talk about
an "upstream function" (the function that called us)
and a "downstream function" (the function that we call).

Each function invocation is connected to 2 other functions in 2 directions each
(except the original caller and the terminating invocations, having 2 arrows each):

1. from upstream: we receive data from upstream via our arguments.
2. to downstream: we send data to downstream by setting the argument of the function we call.
3. from downstream: we receive data from the functions we call via their return values.
4. to upstream: we send data to upstream by returning values.

With these words, we will be able to talk about the "upstream flow of data" or
the "downstream flow of data".

We are always first going downstream, then upstream.

In an attempt to be compatible with the stack view of call stacks,
we can image the stack growing down with its "top" at the bottom.

```shell
    |
    |  t1  t2  t3  t4  t5  t6  t7  (time)
    |                              
    |  4!  4!  4!  4!  4!  4!  4!  (the function we are reading)
    |  ==  --  --  --  --  --  ==
    |      3!  3!  3!  3!  3!
    |      ==  --  --  --  ==
    |          2!  2!  2!
    |          ==  --  ==
    |              1!
    |              ==
    |
    v
  stack
    &
downstream
directions
```

## Examples

### Describing head and tail recursion

We could use "upstream" and "downstream" to say the following:

- In a tail recursive function, the value is calculated while "going downstream".
  The final value is first known by the "most downstream invocation".
- In a head recursive function, the final value is calculated while "going back upstream".
  The final value is only known by the "most upstream invocation".

### Visualizations

To help the reader visualize the up and down directions, here is a head recursive factorial function (arrows show the direction of the flow of data):

```ml
let rec factorial n =
  match n with
  | 1 -> 1
  | _ -> n * factorial (n-1)

assert (factorial 4 = 24)
```

```shell
  upstream
     ↑
     |
     |
time +----(4)----(3)----(2)----(1)----------1---2---6---24--->
     |
     |     4! = ..................................... = 24
     |     ↓                                            ↑
     |     ↓                                            ↑
     |     ↓                                            ↑
     |     ↓                                            ↑
     |     ↓                                            ↑
     |     4! = 4x3! = ........................ = 4x6 = 24
     |            ↓                                 ↑
     |            ↓                                 ↑
     |            ↓                                 ↑
     |            ↓                                 ↑
     |            ↓                                 ↑
     |            3! = 3x2! = ............. = 3x2 = 6
     |                   ↓                      ↑
     |                   ↓                      ↑
     |                   ↓                      ↑
     |                   ↓                      ↑
     |                   ↓                      ↑
     |                   2! = 2x1! = .. = 2x1 = 2
     |                          ↓           ↑
     |                          ↓           ↑
     |                          ↓           ↑
     |                          ↓           ↑
     |                          ↓           ↑
     |                          1!    is    1
     |
     ↓
 downstream
```

As another example, here is a tail recursive function for calculating the factorial
of a number:

```ml
let rec factorial n accum =
  match n with
  | 1 -> accum
  | _ -> factorial (n-1) (n*accum)

assert (factorial 4 1 = 24)
```

```shell
  upstream
     ↑
     |
     |
time +----(4,1)-(3,4)-(2,12)-(1,24)----------------------24--->
     |
     |     4,1   = ................................... = 24
     |           ↓                                       ↑
     |           ↓                                       ↑
     |           ↓                                       ↑
     |           ↓                                       ↑
     |           ↓                                       ↑
     |           3,1x4 = ............................. = 24
     |                 ↓                                 ↑
     |                 ↓                                 ↑
     |                 ↓                                 ↑
     |                 ↓                                 ↑
     |                 ↓                                 ↑
     |                 2,1x4x3 = ..................... = 24
     |                         ↓                         ↑
     |                         ↓                         ↑
     |                         ↓                         ↑
     |                         ↓                         ↑
     |                         ↓                         ↑
     |                         1,1x4x3x2 = ........... = 24
     |                                   ↓               ↑
     |                                   ↓               ↑
     |                                   ↓               ↑
     |                                   ↓               ↑
     |                                   ↓               ↑
     |                                   0,1x4x3x2x1 = 0,24
     |
     ↓
 downstream
```

For the tail recursive example, we could say:

- In the tail recursive example, we are "receiving (n) and (accum) from upstream"
- In the tail recursive example, we are "passing (n-1) and (n\*accum) to downstream"
- In the tail recursive example, the last invocations "returns accum back upstream"

## Conclusion

We do not have a vocabulary for describing the logical flows of data between
function calls. One potential candidate is to use "upstream" and "downstream"
to describe the direction of the data, which seems to facilitate talking and
reasoning about recursive functions.
