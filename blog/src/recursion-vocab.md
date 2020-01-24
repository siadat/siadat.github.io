---
title: Recursion vocabulary
date: 2020-01-22
draft: true
---

[call_stack]: https://en.wikipedia.org/wiki/Call_stack

If words are the building blocks of our thought, then we better have good words
when thinking about complex concepts.
One such complex concept is recursive functions.
In this post, I will try to review the most common terms we use to 
describe the logical behavior of a recursive function and propose a number of new terms
(upstream, downstream, send up and send down) to provide a visual description for the
communication of data between function calls.

## Problem

In a normal call stack, data flow in several directions:

- from the function that called us
- back to the function that called us
- to one or more functions we call
- from one of more functions we call

Data is flowing in 4 different directions via arguments and return values.
Recursive functions are even more complex
because they share the same signatures and variable names
with the functions they are communicating with via these 4 directions.

Another problem is that we won't be able to read a recursive function linearly,
because the returned value of a call to self depends on how you define self.

We need a solution to manage this complexity when reading and writing recursive functions.

## Terms

<!--
- **caller**, **called**, **callee** (not recommended):
  We could refer to the function we are calling as the "called function."
  To distinguish that function from all other called function in the program,
  we might say "the function we call" or "the function that called us."
  This is long and I recommend using "child" and "parent" instead.
-->

- **parent**, **child** (recommended):
  We could refer to the function we are calling as a "child function"
  and the function that called us as the "parent function".
  We send data to a child function, and when a child function returns it
  returns a value back to its parent.

<!--
- **call**, **invoke** (not recommended):
  Synonyms. For non-recursive functions, I recommend "sending" and "receiving",
  and for recursive functions I recommend the more specific "send downstream",
  "receive from downstream", "send upstream", and "receive from upstream."
-->

- **send up**, **send down** (this is a proposal):
  We could say "send up" to visualize a value that we return to our parent, and
  "send down" for passing data as arguments to a child function.
  
  When reading a function, we are focused on the current stack.
  The details of the functions we call are hidden behind invocations.
  That's why I think the child functions go "down" or somewhere less important than the 
  current function's scope. Even though they might be pushed on top of the stack,
  I don't want to think of them as coming "up" and get closer to my face (as
  seems to be the case in call stack terminology).

- **send**, **receive**:
  We could say "data is sent to" or "received" from another function.

- **push**, **pop**:
  We could refer to the function we are calling as being "pushed on top of the stack"
  and when it returns it will be "popped from the top of the stack."
  These terms are motivated by the details of how the call stack memory is managed.

- **upstream**, **downstream** (this is a proposal):
  We could think of a parent function as logically upstream to its child functions,
  and the child functions as logically downstream to their parent.
  So, when a function calls another function (or itself), we are momentarily going downstream,
  until that function returns and we are back.
  We always go downstream first, then come back upstream.
  
  To summarize, there are 4 data flows:
  
  1. from upstream: from parent to us (via our arguments)
  2. to downstream: from us to our child (via child's arguments)
  3. from downstream: from our child to us (via child's return values)
  4. to upstream: from us to our parent (via our return values)
  
  With these words, we will be able to talk about the "upstream flow of data" or
  the "downstream flow of data".
  
  A minor problem with the terms "upstream" and "downstream" is that these flows
  are not exactly "streams".  We are sending data down and up, but not in a
  continuous, stream-like manner.

## Reading

- j

## Examples

These terms are not mutually exclusive. We can use all of them to describe
different aspects of data flow.

- When thinking about each individual instance of a function, we can use "parent", "child", and "children".
- When thinking about the direction of the flow of data, we can use "upstream" and "downstream".
- When thinking about the overall movement of data, we can use "bubble up" and "sink down".
- When thinking about the one-hop movement of data "send up" and "send down".
- When thinking about memory stacks, we can use "pushing" and "popping".

<!--
But I am more concerned about the direction of the flow as opposed to individual actions.
At least temporarily, I am going to stick with "upstream", "downstream",
"child", "children", and "parent" for the rest of this post,
because it sounds natural to use them as adjectives for functions, we can talk about
a "parent function" sending data "downstream" to its "children",
and a "child function" returning data back "upstream" to its "parent function".
-->

## More examples for "upstream" and "downstream"

Except "upstream" and "downstream", the other terms are probably familiar for the reader.
So, I am going to provide some examples of how we might use "upstream" and "downstream" to
describe the direction of the flow of data.

Let's use "upstream" and "downstream" to describe head and tail recursive algorithms:

- In a tail recursive function, the value is calculated while "going downstream".
  The final value is first known by the "most downstream invocation".
- In a head recursive function, the final value is calculated while "going back upstream".
  The final value is only known by the "most upstream invocation".

To help the reader visualize the up and down directions, here is a head recursive factorial function (arrows show the direction of the flow of data):

```ml
let rec factorial n =
  match n with
  | 1 -> 1
  | _ -> n * factorial (n-1)

assert (factorial 4 = 24)
```

```output
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

```output
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

In an attempt to be compatible with the stack view of call stacks,
we can image the stack growing down with its "top" at the bottom.

```output
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


## Conclusion

We considered different terms for describing different components and
attributes of a recursive function. We introduced a number of new terms
(upstream, downstream, send up and send down) for describing the logical
direction of the flow of data, and we decided to use them in conjunction with
other existing terms such as "child function".
