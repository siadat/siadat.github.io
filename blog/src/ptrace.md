---
title: "pcat: cat stdout and stderr of other processes"
date: 2024-03-29
---

While working on https://github.com/siadat/pcat, I learned a few things that I wanted to keep some where. Please keep in mind that I am not experienced in working with ptrace or this kind of low-level programming :)

Here are a few things I learned:
* Tracer is always a single threaded program, tracee can be multiple threads and forked processes. pcat follow forked processes. It is equivalent to running strace --follow
* In general, this is the flow:
    * The tracer tells the kernel it wants to trace pid with a ptrace(ATTACH, pid)
    * The tracee tells the kernel it wants to be traced using ptrace(TRACEME)
    * The tracer waits for kernel to stop the tracee (and its children) using wait(-1)
    * The tracer performs its actions, and asks kernel to resume the tracee until its next syscall using ptrace(SYSCALL, pid)
* This project made me read the source code for strace, which also includes an interesting description about ptrace in https://github.com/strace/strace/blob/master/doc/README-linux-ptrace but it doesn't seem to be up-to-date, because it doesn't include the thing I learned in the next item.
* I also read a Linux kernel commit, specifically https://github.com/torvalds/linux/commit/201766a20e30f982ccfe36bebf which introduced a pretty handy way to get information about syscalls in Linux 5.3. Here's a quick explanation: the tracee program is generally stopped at two points in time, on syscall entry (when the arguments are available), and on syscall exit (when the return value is available). In previous kernel versions, distinguishing between the entry and exit stops was not straightforward. The commit I linked made it easy.
* This is a fun one: you can run strace strace -f …  to understand how strace works!
* man 2 ptrace and man 2 wait were pretty useful
* perf-trace is a pretty cool tool, it can trace syscalls made by all processes
* Another thing I learned is that sometimes pid (thread id) also include tid (thread id). I don't fully understand this yet, but it seems that in Linux a thread is created using clone(CLONE_THREAD).