---
title: "Dependency Inversion Principle in Go"
date: 2020-01-16
tags: go
draft: false
---

In Go, the Dependency Inversion Principle (DIP) can be enforced using type aliases. 
In package main, we want to avoid using a concrete struct from package amazon.
We just want to define an interface and use an implementation provided by package amazon.
Pay attention to the aliases.

```go
package main

import "amazon"

type Store interface {
  Sell(string) Item
}

type Item = interface { // <-- alias
  Price() uint
}

func main() {
  var store Store = amazon.Store{}
  var item  Item  = store.Sell()

  print(item.Price())
}
```

```go
package amazon

type itemInterface = interface { // <-- alias
  Price() uint
}

type Store struct {}
func (Store) Sell(id string) itemInterface {
  return bookStruct{}
}

type bookStruct struct {}
func (bookStruct) Price() uint { return 999 }
```

However, this is not an ideal approach, because the interface exists in two packages.
Ideally, the amazon package should not be aware of the interface, it should only provide the functionality.
