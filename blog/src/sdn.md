---
title: "An introduction to SDN"
date: 2020-01-13
draft: false
---

## Overview

### What does SDN stand for?

SDN stands for Software-Defined Networking.
But it is just a name.
Don't expect it to make any sense.

### What is SDN?

SDN is about building networks.
Networks are built using computers and switches/routers.
In a network, computers are connected to each other using switches/routers.
Switches/routers determine the routing and flow of packets between computers.
SDN is about how we configure switches/routers to perform the routing we want.

Without SDN, you would have to configure each switch/router in your network either manually or through a vendor specific interface.
With SDN, the switch/router provide a standard API for configuration.
With this standard API, you would be able to configure all your switches/routers from one central place.
You would do that by sending commands to and receiving events from them.
For example, if you need to update the configuration of your switches/routers,
you would send a standard API command to all of your switches/routers, and your switche/router configurations will update.

One such switch/router API is OpenFlow.
OpenFlow aims to standardize the most common switches/routers commands through an API.
One switch/router that implements OpenFlow is Open vSwitch.
Open vSwitch is a popular virtual switch/router that is capable of talking the OpenFlow protocol.

### Summary

The goal of SDN is to facilitate configuring switches/routers (hence networks)
via standard APIs and high-level software,
as opposed to having to handle vendor specific interfaces on each router.

---

## Details

If you don't know what SDN, OpenFlow, or Open vSwitch is, begin by reading the Overview section.

### History

Software-defined networking (SDN) has several traces of history explained by Nick Feamster in his [The Road to SDN][road_to_sdn].
The most famous one, and the one I am familiar with, is [OpenFlow][openflow] (2008) which was a generalization of [Ethane][ethane].

### What is SDN? (again)

Routers devices perform 3 types of work. They are known as "planes" (read KR's "4.3 What is Inside a Router?"):

- **Control plane**: given a packet, decide which switch's port in the switch to forward the signal to.
- **Data plane**: when the output port is decided, perform the actual forwarding.
- **Management plane**

Essentially, the goal of SDN (and NFV) is to simplify the management of
networks by having the router/switch "control plane" configurations centeralized and in one
place and by doing the configuration in normal software, as opposed to hardware
or vendor-specific crap.

Before the SDN paradigm shift, these planes were coupled, and their API was controlled by vendors.
The SDN philosophy is in order to facilitate innovation in networking,
we should learn from other computer science disciplines,
like programming languages, and define better abstractions, like [layering][scott_shenker_future_of_networking].

SDN folks say we want switches that let us write readable control-plane software.
In [OpenFlow][openflow] ([spec][openflow_spec], particularly the "The OpenFlow
Switch Protocol" section and those three kinds of messages), the switch will
ask an OpenFlow controller
(a TCP server on port 6653 with TLS, both sides may send messages)
what to do with this kind of packet with this source and destination (i.e., with this "flow").
So all switches in one network will ask this central controller what to do.
In other words, we are centeralizing the control plane.
This centeralizing makes it easier to reason about the network
and make changes in one place for all, which is a great advantage.
But it introduces a single point of failure.
But fear not, because we can run a cluster of a distributed controller.
The most famous one is [Onix](onix).
Another one written in Go on top of Etcd is [Beehive-netctrl](beehive) ([paper1][beehive_paper1], [paper2][beehive_paper2]).

IMO, OpenFlow is too big and not well designed.
It is a big bag of predefined [TLVs][tlv] (as opposed to general purpose ones).

### What is an OpenFlow router?

OpenFlow is an API specification for configuring routers.
An OpenFlow router is a router that implements this API.
OpenFlow specifies the behavior of the router.
For example, the OpenFlow spec might say that whenever the router receives
a packet it should make a TCP call to a server (known as OpenFlow controller)
to ask that server what to do about the packet it just received.

### What is Open vSwitch?

Open vSwitch is a virtual switch (see NFV),
which implements OpenFlow protocol as well
(so you can control it using a software controller).

### Why isn't this routing done using a normal PC?

Because normal PCs have very few input/output ports,
and their packet handling speed is very slow compared to the required line-rate.

### What is NFV?

Network function virtualization ([whitepaper][nfv]) is virtualizing a switch,
as opposed to a hardware switch device,
and using it to create complicated networks of VMs.
NFV is part of "softwarization" of networks.

### What is P4?

[P4][p4] is a way to make it easy to modify the data-plane behavior using software!
Recall that data plane's responsibility has often been implemented in hardware.
Because it needs to as fast as line-rate (ie giga or tera bit per second)

### Is SDN the same as OpenFlow?

No. OpenFlow was one of the first famous solutions to a common problem (controlling switches using software).
Other solutions are Cisco's Open Network Environment ([whitepaper][cisco_one_whitepaper]).
This document by Cisco, [SDN: Why We Like It and How We Are Building On It][cisco_why_sdn], provides a great overview of SDN.

### Why now?
Indeed.
Network people, [Scott Shenken says][scott_shenker_future_of_networking], like complexity.
But the reason, I think, is the increase in use of virtual machines
and the need to connect them using complex and configurable networks for them
across multiple datacenters.
So, in one word cloud computing is one of the motivations (although not the only one: e.g., OpenFlow
was originally designed to control department networks at Stanford).

[road_to_sdn]: https://www.cs.princeton.edu/courses/archive/fall13/cos597E/papers/sdnhistory.pdf
[ethane]: http://cs.brown.edu/courses/csci2950-u/s14/papers/Casado07Ethane.pdf
[openflow]: http://ccr.sigcomm.org/online/files/p69-v38n2n-mckeown.pdf
[openflow_spec]: https://www.opennetworking.org/software-defined-standards/specifications/
[scott_shenker_future_of_networking]: https://www.youtube.com/watch?v=YHeyuD89n1Y
[cisco_why_sdn]: https://www.cisco.com/c/dam/en_us/solutions/industries/docs/gov/cis13090_sdn_sled_white_paper.pdf
[cisco_one_whitepaper]: https://www.cisco.com/c/en/us/products/collateral/switches/nexus-1000v-switch-vmware-vsphere/white_paper_c11-728045.pdf
[onix]: http://static.usenix.org/event/osdi10/tech/full_papers/Koponen.pdf
[beehive]: https://github.com/kandoo/beehive-netctrl
[beehive_paper1]: http://conferences.sigcomm.org/sosr/2016/papers/sosr_paper17.pdf
[beehive_paper2]: http://conferences.sigcomm.org/hotnets/2014/papers/hotnets-XIII-final17.pdf 
[p4]: https://en.wikipedia.org/wiki/P4_(programming_language)
[nfv]: https://portal.etsi.org/NFV/NFV_White_Paper.pdf
[tlv]: https://en.wikipedia.org/wiki/Type-length-value
