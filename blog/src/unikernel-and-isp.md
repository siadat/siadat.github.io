---
title: Unikernels and the Interface Segregation Principle
date: 2020-01-20
draft: false
---

I wonder if we could, for a moment, strech the scope of the [Interface Segregation Principle][isp]
to components and OS architecture and interpret it to support the following two arguments:

- Depending on a framework for a large project is almost always a bad idea.
  Almost every team I have talked to have had problems when a framework in their stack
  is updated and changes under their feet.
- Depending on an OS distribution and a monolithic kernel is not that far from depending on a framework.
  OSs and the Linux kernel are more stable than frameworks, but they contain a lot of
  complexity that we do not need.
  In other words, by removing the parts of the kernel that we do not need,
  we will reduce the cost of maintaining unnecessary dependencies.

From a software development perspective,
unikernels ([paper 1][unikernel_1], [paper 2][unikernel_2]) and other libOSs
seem like a promising solution for reducing our external dependencies to a bare minimum.

[unikernel_1]: http://anil.recoil.org/papers/2013-asplos-mirage.pdf
[unikernel_2]: http://queue.acm.org/detail.cfm?id=2566628
[isp]: https://en.wikipedia.org/wiki/Interface_segregation_principle
