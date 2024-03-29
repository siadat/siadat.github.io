---
title: Learning Cython
date: 2023-04-20
draft: true
---

TIL a bit about Cython. My learnings experiments are in [github.com/siadat/learn-cython](https://github.com/siadat/learn-cython)

From [Cython's README](https://github.com/cython/cython):

> Cython is a Python compiler that makes writing C extensions for Python as easy as Python itself

* Cython is installed as a normal package, e.g. `poetry add cython`
* Cython is a superset of Python: all Python code is valid Cython.
* Cython files have .pyx extensions.
* `poetry run cython program.pyx` will generate a program.c file.
* You can also run `poetry run cython program.py` (note it is .py, not .pyx), but the generated .c file will be larger, and I think it will rely on Python interpreter for handling memory for those objects.
* The Python `print("hello")` call expression is translated to
```
  /* "hello.pyx":3
 * def greet():
 *     print("hello")
 *     print("hello")             # <<<<<<<<<<<<<<
 */
  if (__Pyx_PrintOne(0, __pyx_n_s_hello) < 0) __PYX_ERR(0, 3, __pyx_L1_error)
```
In this example, `__pyx_n_s_hello` represents the `"hello"` string, via `__pyx_k_hello`.
* Note that the Cython program contains functions definitions only, there are no statements in the global scope.
* The `poetry run cythonize program.py` command combines all imported packages and generates a single .c file. On the other hand, `poetry run cython program.py` is lower level and generates a .c file per .py or .pyx file.

## TODO `poetry run easycython`?

Resources
* https://www.youtube.com/watch?v=NfnMJMkhDoQ&t=479s