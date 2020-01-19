---
title: "TCP congestion control is elegant"
date: 2020-01-18
draft: false
---

[AIMD]: https://en.wikipedia.org/wiki/Additive_increase/multiplicative_decrease

The goals of TCP's congestion control are to achieve the following:

- Efficient use of network
- Fairness among senders

The Additive Increase and Multiplicative Decrease ([AIMD][AIMD]) algorithm
achieves efficiency by increasing the TCP window size by a constant value (e.g., 1).
It also achieves fairness by multiplying the current window size by a value (e.g., 0.5).
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
          | x  \    /
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

        x = unfair and under-utilized window sizes
```

Any point bellow the capacity line (e.g. x) moves up-and-right parallel to y=x, until it reaches the full capacity line (x+y=c line).
At that point it goes back, by halving its distance to the origin point.
After several iterations it will eventually fall on the fairness line.

## Why does it work?

One thing to keep in mind is that packet loss acts as an indirect method of synchronization for the two senders,
in the sense that both senders detect congestion (by interpreting packet loss as congestion) at the same time.
(However, this is not true if the number of senders grow and delays are increased in which case the senders are NOT synchronized, but let's not go there.)

Now, imagine instead of multiplying the value by `0.5` we were multiplying it by zero (or a number closer to zero).
That way we would fall on the y=x line instantly when the first packet loss is detected.
The problem addressed by `0.5` is that if we multiply by zero the network will
be under-utilized because TCP window size would have been zeroed every time a
packet loss was observered.
So, we trade off convergence speed by shrinking the window size slightly slower and in several iterations.

## Why is it beautiful?

This algorithm is beautiful because it is simple and distributed.
It requires no direct communication between the senders.
Technically the senders *are* coordinating, but only in an indirect way, via packet loss occurances.
This reminds me of "stigmergy" and how agents in a swarm might communicate indirectly by changing their environment,
e.g., ants and pheromone.
