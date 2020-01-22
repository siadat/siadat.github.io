---
title: Recursion vocabulary
date: 2020-01-22
draft: false
---

Recursive functions are complex because they are connected to (at least) 2 other functions bidirectionally,
while sharing the same signature, return values, and variables.
In a recursive function, data flows
from the function that called it,
back to the function that called it,
to one or more functions it calls,
and from those functions.
Hence, data flows in 4 different ways.

I think it would be a good idea to have a few names to differentiate these flows.
<!--Similar to how stacks have top and bottom, -->
We could think of a caller functions as logically **upstream** to the function it calls,
and the called functions as logically **downstream** to its caller.

The problem is that they are not exactly "streams".
We are sending data down and up, but not in a continuous way.
Perhaps "send down" and "send up", or "bubble up" and "sink down" would be better alternatives.
I am going to stick with upstream and downstream for the rest of this post,
because it makes it sounds natural to use them as adjectives and talk about
an upstream function (our caller)
and a downstream function (we call).

<!--
Downstream in the sense that with each recursive call we go down and get farther from the original caller, which sits on top.
Upstream in the sense that everytime a recursive function returns we get closer to the original caller on top.
-->

As shown in the following figure for recursively calculating the factorial of a number,
each function invocation is connected to 2 other functions with 4 arrows
(except the original caller and the terminating invocations, having 2 arrows each):

1. from upstream (my arguments)
2. to downstream (sent to a downstream function as arguments)
3. from downstream (received from the downstream function's return value)
4. to upstream (my return value)

## Examples

Here is a head recursive factorial function (arrows show the direction of the flow of data):

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

In this example, we could say that
we are "receiving (n) and (accum) from upstream",
we are "passing (n-1) and (n\*accum) to downstream",
and the last call to the function "returns accum back upstream,"
which is in trun directly "returned back upstream" (tail recursion).

In a tail recursive function, the value is calculated while going downstream.
The final value is first known by the most downstream invocation.

In a head recursive function, the final value is calculated while going back upstream.
The final value is only known by the most upstream invocation.

This post will probably be edited in the future,
because I am not quite satisfied with it yet.
