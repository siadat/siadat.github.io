---
title: 'Recursive "build up" and "build down"'
date: 2020-01-22
draft: false
---

While writing a recursive function,
I find it useful to use the phrase "building up"
or "building down" the result.

Here is the factorial function "building up" the result
(note that the resulting value of 24 is only known by the first function call):

```ml
let rec factorial n =
  match n with
  | 1 -> 1
  | _ -> n * factorial (n-1)

assert (factorial 4 = 24)
```

```output
↑
|
|
+----(4)----(3)----(2)----(1)----------1---2---6---24---> time
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
```

And here is a tail-recursive factorial function "building down" the result
(note that resulting value of 24 known by the deepest function call):

```ml
let rec factorial n accum =
  match n with
  | 1 -> accum
  | _ -> factorial (n-1) (n*accum)

assert (factorial 4 1 = 24)
```

```output
↑
|
|
+----(4,1)-(3,4)-(2,12)-(1,24)----------------------24---> time
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
```

The result of a head-recursive function is often "built up",
by which I mean the result becomes gradually more complete *after* each nested call returns.
The deepest invocation of the recursive function does not know the final result.

The result of a tail-recursive function is (always?) "built down",
by which I mean the result is gradually built by the caller *before* being passed as an argument to a deeper function.
The last invokation of the recursive function knows the final result.

In tail-recursive functions (where the value is "built down"),
I find it useful to name the value being built down to something like "accum".

Here is a more complex example of an int-to-natural function "building up" the result:

```ocaml
type nat = Zero | Succ of nat

let rec int_to_nat (x:int) : (nat option) =
  if x < 0 then None else
  match x with
  | 0 -> None
  | _ -> let y = int_to_nat (x-1) in
    match y with
    | None -> None
    | Some z -> Some (Succ z);;
```

That function will stack overflow for large values of x.
Here is the tail-recursive version of the function above, this time "building down" the result
(and fixing the stack overflow issue):

```ocaml
type nat = Zero | Succ of nat

let int_to_nat (x:int) : (nat option) =
  if x < 0 then None else
  let rec int_to_nat' (x:int) (accum:nat) : (nat option) =
    match x with
    | 0 -> Some accum
    | _ -> int_to_nat' (x-1) (Succ accum)
  in int_to_nat' x Zero;;
```
