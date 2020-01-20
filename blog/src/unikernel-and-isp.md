---
title: Unikernels and the Interface Segregation Principle
date: 2020-01-20
draft: false
---

I interpret the Interface Segregation Principle ([ISP][isp]) to mean the following two opinions:

- Depending on a framework for a large project is almost always a mistake.
  Almost every teams I have talked to have had problem when the frame work
  is updated and changes under their feet.
- Depending on an OS distribution is not that far from depending on a framework.
  OSs and the Linux kernel are more stable than frameworks, but they contain a lot of
  complexity that we do not need or are aware of.

Unikernels ([1][unikernel_1] and [2][unikernel_2]) and other library OSs
seem like a good solution to reduce our external dependencies to a bare minimum.

[unikernel_1]: http://anil.recoil.org/papers/2013-asplos-mirage.pdf
[unikernel_2]: http://queue.acm.org/detail.cfm?id=2566628
[isp]: https://en.wikipedia.org/wiki/Interface_segregation_principle
