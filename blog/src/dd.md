---
title: "Learning why trying tracy"
date: 2024-03-07
draft: true
---

- `man -K zero` led me to `man 4 zero` and I learned it returns '\0's
- I learned about `-N` in `yes | head -c 5 | nc -N localhost 8000`: without it, nc process does not exit after EOF is seen in stdin.
- I learned that the `head` command can take number of bytes in human readable units, eg `head -c 1G`
- It is not recommended to run Tracy on a VM, which is unfortunate, because my main development machine is a VM.

> The best way to run Tracy is on bare metal. Avoid profiling applications in virtualized environments, including services provided in the cloud. Virtualization interferes with the critical facilities needed for the profiler to work, influencing the results you get.

- 