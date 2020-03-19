---
title: Cassandra in a nutshell
date: 2020-03-19
draft: false
---

Cassandra is a distributed system that stores data in several nodes.
There is no central config server or router as in some other databases.
So, one might wonder how Cassandra shards the data, how it distributes the data to the nodes, and, in general, how it satisfies each query.

When we CREATE TABLE, we specify one or more columns with which Cassandra determines the node or nodes who should store each propsective record.
In Cassandra terminology, this ordered list of columns is called a "partition key".

When we INSERT a record in that table, Cassandra uses the value of partition key columns of that record as the input to a hash function.
The resulting hash is a 128 bit integer. Cassandra uses this number (and the
current topology of the cluster) to decide which node or nodes should store the new record.

Similarly, when we execute SELECT, Cassandra calculates the hash of the partition key columns, and figures out
which node or nodes should have (if it exists at all) the requested record.

Each node owns a specific range or ranges of hash values between the smallest possible value
and the largest possible value.  In Cassandra terminology, this is conceptualized as a "ring" that is divided by the nodes.

The limitation imposed by this design is that all write and read requests must include the partition key columns in the order they
were specified when we created the table. In that sense, the hash of the partition key columns acts like a key in a key-value system.
For example, if our partition key columns is (id), all our SELECT conditions must start with WHERE id = x, and all our INSERTs must include a value for id.
We are not able to run a SELECT statement with condition WHERE title = x. 
Without the partition key columns, Cassandra would have no idea where to find or write the data and has to do a full table scan across all the nodes,
which Cassandra avoids by default. 
