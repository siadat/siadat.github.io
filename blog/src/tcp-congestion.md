---
title: "TCP congestion control is elegant"
date: 2020-01-18
draft: false
---

The goals of TCP's congestion control are to achieve the following:

- Efficient use of network
- Fairness among senders

The Additive Increase and Multiplicative Decrease (AIMD) algorithm
achieves efficiency by increasing the TCP window size by a constant value (e.g., 1).
It also achieves fairness by dividing the current window size by a value (e.g., 2).
These two are enough to converge to efficiency and fairness.

```text
          y = sender 1's window size
          ^
          |
          |               fairness line (x=y)
capacity  \              /
line      |\            /
(x+y=c)   | \          /
          |  \        /
          |   \      /
          |    \    /
          |     \  /
          |      \/ ideal point
          |      /\ (efficient and fair)
          |     /  \
          |    /    \
          |   /      \
          |  /        \
          | /          \
          |/            \
          +--------------\------> x = sender 2's window size
        (0,0)
```

Any point bellow the full capacity line moves up-right parallel to y=x, until it reaches the full capacity line (x+y=c line).
At that point it goes back, by halving its distance to the origin point.
After several iterations it will eventually fall on the fairness line.

## Why does it work?

Imagine instead of multiplying the value by `0.5` we were multiplying it by zero.
That way we would fall on the y=x line in one iteration.
The problem addressed by `0.5` is network is under-utilized if window size was zeroed every time a packet loss was observered.
So, we slow the convergence by shrinking the window size a bit slower and in several iterations.

## Why is it beautiful?

This algorithm is beautiful because it is simple and distributed.
It requires no coordination between the senders.
However, technically the senders *ARE* communicating, but in an indirect way, via packet loss occurances.
This reminds me of "stigmergy" and how agents in a swarm might communicate indirectly by changing their environment,
e.g., ants and pheromone.

