## Measuring heavy CPU load in Node

The goal is to get a general idea about Node's ability to handle a heavy CPU load and determine the best way to handle upcoming requests when working with heavy CPU operations

[Fastify](https://www.fastify.io) is used as a server framework

Performance measured with [autocannon](https://www.npmjs.com/package/autocannon)

### Test benches

 - PC: i3-4160 (2 cores / 4 threads), 8GB of DDR3 RAM

 - MBP: i7-8750H (6 cores / 12 threads), 16GB of DDR4 RAM

### Measurements

#### 1. Simple server

A simple server that uses 1 core / 1 process / 1 thread to handle all incoming requests

- MBP

```text
// autocannon -c 100 -d 20 http://localhost:5001
Running 20s test @ http://localhost:5001
100 connections

┌─────────┬─────────┬─────────┬─────────┬─────────┬────────────┬───────────┬─────────┐
│ Stat    │ 2.5%    │ 50%     │ 97.5%   │ 99%     │ Avg        │ Stdev     │ Max     │
├─────────┼─────────┼─────────┼─────────┼─────────┼────────────┼───────────┼─────────┤
│ Latency │ 9578 ms │ 9778 ms │ 9979 ms │ 9979 ms │ 9800.38 ms │ 126.58 ms │ 9979 ms │
└─────────┴─────────┴─────────┴─────────┴─────────┴────────────┴───────────┴─────────┘
┌───────────┬─────┬──────┬─────┬─────────┬────────┬───────┬───────┐
│ Stat      │ 1%  │ 2.5% │ 50% │ 97.5%   │ Avg    │ Stdev │ Min   │
├───────────┼─────┼──────┼─────┼─────────┼────────┼───────┼───────┤
│ Req/Sec   │ 0   │ 0    │ 0   │ 5       │ 0.4    │ 1.25  │ 3     │
├───────────┼─────┼──────┼─────┼─────────┼────────┼───────┼───────┤
│ Bytes/Sec │ 0 B │ 0 B  │ 0 B │ 1.03 kB │ 82.3 B │ 255 B │ 618 B │
└───────────┴─────┴──────┴─────┴─────────┴────────┴───────┴───────┘

Req/Bytes counts sampled once per second.

300 requests in 20.05s, 1.65 kB read
192 errors (187 timeouts)
```

- PC

```text
// autocannon -c 100 -d 20 http://localhost:5001
Running 20s test @ http://localhost:5001
100 connections

┌─────────┬────────┬─────────┬─────────┬─────────┬────────────┬────────────┬─────────┐
│ Stat    │ 2.5%   │ 50%     │ 97.5%   │ 99%     │ Avg        │ Stdev      │ Max     │
├─────────┼────────┼─────────┼─────────┼─────────┼────────────┼────────────┼─────────┤
│ Latency │ 551 ms │ 5089 ms │ 8060 ms │ 8318 ms │ 4724.03 ms │ 1721.66 ms │ 8486 ms │
└─────────┴────────┴─────────┴─────────┴─────────┴────────────┴────────────┴─────────┘
┌───────────┬─────┬──────┬─────────┬─────────┬─────────┬───────┬───────┐
│ Stat      │ 1%  │ 2.5% │ 50%     │ 97.5%   │ Avg     │ Stdev │ Min   │
├───────────┼─────┼──────┼─────────┼─────────┼─────────┼───────┼───────┤
│ Req/Sec   │ 0   │ 0    │ 12      │ 12      │ 10.9    │ 3.05  │ 4     │
├───────────┼─────┼──────┼─────────┼─────────┼─────────┼───────┼───────┤
│ Bytes/Sec │ 0 B │ 0 B  │ 2.46 kB │ 2.46 kB │ 2.24 kB │ 625 B │ 820 B │
└───────────┴─────┴──────┴─────────┴─────────┴─────────┴───────┴───────┘

Req/Bytes counts sampled once per second.

398 requests in 20.2s, 44.7 kB read
80 errors (40 timeouts)
```

#### 2. Clustered server

A server that uses `cluster` module to create additional Node processes to handle incoming requests utilizing all of the available CPU cores, limited by the number of CPU cores obtained with `os.cpus().length`

All of these processes are still using single threads for Javascript

- MBP

```text
// autocannon -c 100 -d 20 http://localhost:5001
Running 20s test @ http://localhost:5001
100 connections

┌─────────┬────────┬─────────┬─────────┬─────────┬────────────┬───────────┬─────────┐
│ Stat    │ 2.5%   │ 50%     │ 97.5%   │ 99%     │ Avg        │ Stdev     │ Max     │
├─────────┼────────┼─────────┼─────────┼─────────┼────────────┼───────────┼─────────┤
│ Latency │ 510 ms │ 1952 ms │ 3761 ms │ 5454 ms │ 2015.55 ms │ 797.31 ms │ 8241 ms │
└─────────┴────────┴─────────┴─────────┴─────────┴────────────┴───────────┴─────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬───────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼───────┼─────────┤
│ Req/Sec   │ 36      │ 36      │ 48      │ 53      │ 46.45   │ 3.79  │ 36      │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼───────┼─────────┤
│ Bytes/Sec │ 7.42 kB │ 7.42 kB │ 9.89 kB │ 10.9 kB │ 9.57 kB │ 780 B │ 7.42 kB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴───────┴─────────┘

Req/Bytes counts sampled once per second.

1k requests in 20.04s, 191 kB read
```

- PC

```text
// autocannon -c 100 -d 20 http://localhost:5001
Running 20s test @ http://localhost:5001
100 connections

┌─────────┬────────┬─────────┬─────────┬─────────┬────────────┬────────────┬──────────┐
│ Stat    │ 2.5%   │ 50%     │ 97.5%   │ 99%     │ Avg        │ Stdev      │ Max      │
├─────────┼────────┼─────────┼─────────┼─────────┼────────────┼────────────┼──────────┤
│ Latency │ 344 ms │ 3193 ms │ 7303 ms │ 7441 ms │ 3544.42 ms │ 2060.86 ms │ 11230 ms │
└─────────┴────────┴─────────┴─────────┴─────────┴────────────┴────────────┴──────────┘
┌───────────┬────────┬────────┬─────────┬─────────┬─────────┬─────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min    │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Req/Sec   │ 20     │ 20     │ 28      │ 36      │ 28.05   │ 5.69    │ 20     │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Bytes/Sec │ 4.1 kB │ 4.1 kB │ 5.77 kB │ 7.42 kB │ 5.77 kB │ 1.18 kB │ 4.1 kB │
└───────────┴────────┴────────┴─────────┴─────────┴─────────┴─────────┴────────┘

Req/Bytes counts sampled once per second.

696 requests in 20.17s, 115 kB read
35 errors (1 timeouts)
```

#### 3. Child Process server

A server where a Worker process forked every time request hits the server (i. e. request handler function is running), this creates lots of new processes and affects the performance significantly, since there is no limit to the amount of processes that can be forked

- MBP

```text
// autocannon -c 100 -d 20 http://localhost:5001
Running 20s test @ http://localhost:5001
100 connections

┌─────────┬─────────┬─────────┬─────────┬─────────┬────────────┬──────────┬─────────┐
│ Stat    │ 2.5%    │ 50%     │ 97.5%   │ 99%     │ Avg        │ Stdev    │ Max     │
├─────────┼─────────┼─────────┼─────────┼─────────┼────────────┼──────────┼─────────┤
│ Latency │ 2375 ms │ 3154 ms │ 3910 ms │ 4310 ms │ 3148.87 ms │ 385.8 ms │ 4311 ms │
└─────────┴─────────┴─────────┴─────────┴─────────┴────────────┴──────────┴─────────┘
┌───────────┬─────┬──────┬──────┬─────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%  │ 2.5% │ 50%  │ 97.5%   │ Avg     │ Stdev   │ Min     │
├───────────┼─────┼──────┼──────┼─────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 0   │ 0    │ 29   │ 44      │ 29.05   │ 10.78   │ 6       │
├───────────┼─────┼──────┼──────┼─────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 0 B │ 0 B  │ 6 kB │ 9.11 kB │ 6.01 kB │ 2.23 kB │ 1.24 kB │
└───────────┴─────┴──────┴──────┴─────────┴─────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.

681 requests in 20.05s, 120 kB read
```

- PC

```text
// autocannon -c 100 -d 20 http://localhost:5001
Running 20s test @ http://localhost:5001
100 connections

┌─────────┬─────────┬─────────┬─────────┬─────────┬────────────┬────────────┬─────────┐
│ Stat    │ 2.5%    │ 50%     │ 97.5%   │ 99%     │ Avg        │ Stdev      │ Max     │
├─────────┼─────────┼─────────┼─────────┼─────────┼────────────┼────────────┼─────────┤
│ Latency │ 1625 ms │ 6115 ms │ 7802 ms │ 8154 ms │ 5816.94 ms │ 1485.44 ms │ 8409 ms │
└─────────┴─────────┴─────────┴─────────┴─────────┴────────────┴────────────┴─────────┘
┌───────────┬─────┬──────┬─────────┬────────┬─────────┬─────────┬───────┐
│ Stat      │ 1%  │ 2.5% │ 50%     │ 97.5%  │ Avg     │ Stdev   │ Min   │
├───────────┼─────┼──────┼─────────┼────────┼─────────┼─────────┼───────┤
│ Req/Sec   │ 0   │ 0    │ 13      │ 42     │ 14.55   │ 9.98    │ 2     │
├───────────┼─────┼──────┼─────────┼────────┼─────────┼─────────┼───────┤
│ Bytes/Sec │ 0 B │ 0 B  │ 2.69 kB │ 8.7 kB │ 3.01 kB │ 2.06 kB │ 413 B │
└───────────┴─────┴──────┴─────────┴────────┴─────────┴─────────┴───────┘

Req/Bytes counts sampled once per second.

391 requests in 20.72s, 60.2 kB read
```

#### 4. Worker Threads server

A server where a new Worker Thread is launched every time request hits the server (i. e. request handler function is running), this affects the performance since lots of new threads are created to handle incoming requests

All of these threads are bound to a single process

The idea here is that thread context switching is done much faster than the process context switching

- MBP

```text
// autocannon -c 100 -d 20 http://localhost:5001
Running 20s test @ http://localhost:5001
100 connections

┌─────────┬─────────┬─────────┬─────────┬─────────┬────────────┬───────────┬─────────┐
│ Stat    │ 2.5%    │ 50%     │ 97.5%   │ 99%     │ Avg        │ Stdev     │ Max     │
├─────────┼─────────┼─────────┼─────────┼─────────┼────────────┼───────────┼─────────┤
│ Latency │ 2648 ms │ 3160 ms │ 3577 ms │ 3741 ms │ 3125.99 ms │ 237.66 ms │ 3837 ms │
└─────────┴─────────┴─────────┴─────────┴─────────┴────────────┴───────────┴─────────┘
┌───────────┬─────┬──────┬─────────┬─────────┬────────┬─────────┬─────────┐
│ Stat      │ 1%  │ 2.5% │ 50%     │ 97.5%   │ Avg    │ Stdev   │ Min     │
├───────────┼─────┼──────┼─────────┼─────────┼────────┼─────────┼─────────┤
│ Req/Sec   │ 0   │ 0    │ 31      │ 74      │ 29.95  │ 21.09   │ 6       │
├───────────┼─────┼──────┼─────────┼─────────┼────────┼─────────┼─────────┤
│ Bytes/Sec │ 0 B │ 0 B  │ 6.42 kB │ 15.3 kB │ 6.2 kB │ 4.36 kB │ 1.24 kB │
└───────────┴─────┴──────┴─────────┴─────────┴────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.

699 requests in 20.05s, 124 kB read
```

- PC

```text
// autocannon -c 100 -d 20 http://localhost:5001
Running 20s test @ http://localhost:5001
100 connections

┌─────────┬─────────┬─────────┬─────────┬─────────┬────────────┬───────────┬─────────┐
│ Stat    │ 2.5%    │ 50%     │ 97.5%   │ 99%     │ Avg        │ Stdev     │ Max     │
├─────────┼─────────┼─────────┼─────────┼─────────┼────────────┼───────────┼─────────┤
│ Latency │ 4504 ms │ 5412 ms │ 9371 ms │ 9709 ms │ 5633.47 ms │ 970.66 ms │ 9900 ms │
└─────────┴─────────┴─────────┴─────────┴─────────┴────────────┴───────────┴─────────┘
┌───────────┬─────┬──────┬─────┬─────────┬─────────┬─────────┬───────┐
│ Stat      │ 1%  │ 2.5% │ 50% │ 97.5%   │ Avg     │ Stdev   │ Min   │
├───────────┼─────┼──────┼─────┼─────────┼─────────┼─────────┼───────┤
│ Req/Sec   │ 0   │ 0    │ 0   │ 94      │ 14.2    │ 25.14   │ 1     │
├───────────┼─────┼──────┼─────┼─────────┼─────────┼─────────┼───────┤
│ Bytes/Sec │ 0 B │ 0 B  │ 0 B │ 19.4 kB │ 2.93 kB │ 5.18 kB │ 206 B │
└───────────┴─────┴──────┴─────┴─────────┴─────────┴─────────┴───────┘

Req/Bytes counts sampled once per second.

384 requests in 20.79s, 58.5 kB read
```

#### 5. Clustered Threads server

A clustered server that launches a Worker Thread to do the heavy task every time request hits the server (i. e. request handler function is running)

Number of processes are limited to `os.cpus().length`, and each process creates a thread to handle a heavy task, so the amount of additional threads are restricted to 2 for each process (main thread and heavy task thread)

Creating additional thread within a process negatively impacts the performance compared to just using `cluster`

- MBP

```text
// autocannon -c 100 -d 20 http://localhost:5001
Running 20s test @ http://localhost:5001
100 connections

┌─────────┬─────────┬─────────┬─────────┬─────────┬────────────┬───────────┬─────────┐
│ Stat    │ 2.5%    │ 50%     │ 97.5%   │ 99%     │ Avg        │ Stdev     │ Max     │
├─────────┼─────────┼─────────┼─────────┼─────────┼────────────┼───────────┼─────────┤
│ Latency │ 2635 ms │ 3013 ms │ 3361 ms │ 3493 ms │ 3008.08 ms │ 193.95 ms │ 3630 ms │
└─────────┴─────────┴─────────┴─────────┴─────────┴────────────┴───────────┴─────────┘
┌───────────┬─────┬──────┬─────────┬─────────┬─────────┬────────┬───────┐
│ Stat      │ 1%  │ 2.5% │ 50%     │ 97.5%   │ Avg     │ Stdev  │ Min   │
├───────────┼─────┼──────┼─────────┼─────────┼─────────┼────────┼───────┤
│ Req/Sec   │ 0   │ 0    │ 37      │ 76      │ 30.05   │ 26.08  │ 1     │
├───────────┼─────┼──────┼─────────┼─────────┼─────────┼────────┼───────┤
│ Bytes/Sec │ 0 B │ 0 B  │ 7.66 kB │ 15.7 kB │ 6.22 kB │ 5.4 kB │ 207 B │
└───────────┴─────┴──────┴─────────┴─────────┴─────────┴────────┴───────┘

Req/Bytes counts sampled once per second.

701 requests in 20.06s, 124 kB read
```

- PC

```text
// autocannon -c 100 -d 20 http://localhost:5001
Running 20s test @ http://localhost:5001
100 connections

┌─────────┬────────┬─────────┬─────────┬─────────┬───────────┬────────────┬─────────┐
│ Stat    │ 2.5%   │ 50%     │ 97.5%   │ 99%     │ Avg       │ Stdev      │ Max     │
├─────────┼────────┼─────────┼─────────┼─────────┼───────────┼────────────┼─────────┤
│ Latency │ 986 ms │ 3302 ms │ 9852 ms │ 9867 ms │ 4421.1 ms │ 3026.64 ms │ 9986 ms │
└─────────┴────────┴─────────┴─────────┴─────────┴───────────┴────────────┴─────────┘
┌───────────┬─────┬──────┬─────────┬─────────┬─────────┬─────────┬───────┐
│ Stat      │ 1%  │ 2.5% │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min   │
├───────────┼─────┼──────┼─────────┼─────────┼─────────┼─────────┼───────┤
│ Req/Sec   │ 0   │ 0    │ 7       │ 43      │ 13.5    │ 14.12   │ 2     │
├───────────┼─────┼──────┼─────────┼─────────┼─────────┼─────────┼───────┤
│ Bytes/Sec │ 0 B │ 0 B  │ 1.44 kB │ 8.88 kB │ 2.79 kB │ 2.91 kB │ 412 B │
└───────────┴─────┴──────┴─────────┴─────────┴─────────┴─────────┴───────┘

Req/Bytes counts sampled once per second.

420 requests in 20.29s, 50.1 kB read
77 errors (77 timeouts)
```

#### 6. Queued Threads server

This is the server that queues incoming requests and then handles them with Worker Threads

When launching the test, 100 TCP connections are created and are opened during the whole test

Each connection sends requests that are handled by HTTP module and then Fastify controller

Several Worker Threads are launched at the server start, and are used to offload the heavy task into them, so that the main thread that runs Fastify server can serve the connections

Requests are handled if workers are available, otherwise they are queued and then processed when free worker is available

This approach avoids main thread blocking, and everything works within the single process

As a result, this server has pretty much the same performance as with a `cluster` module, but only a single process is being used

- MBP

```text
// autocannon -c 100 -d 20 http://localhost:5001

TODO: measurements
```

- PC

```text
// autocannon -c 100 -d 20 http://localhost:5001
Running 20s test @ http://localhost:5001
100 connections

┌─────────┬────────┬─────────┬─────────┬─────────┬────────────┬───────────┬─────────┐
│ Stat    │ 2.5%   │ 50%     │ 97.5%   │ 99%     │ Avg        │ Stdev     │ Max     │
├─────────┼────────┼─────────┼─────────┼─────────┼────────────┼───────────┼─────────┤
│ Latency │ 657 ms │ 3188 ms │ 3334 ms │ 3344 ms │ 2979.67 ms │ 646.89 ms │ 3351 ms │
└─────────┴────────┴─────────┴─────────┴─────────┴────────────┴───────────┴─────────┘
┌───────────┬─────────┬─────────┬─────────┬────────┬─────────┬───────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%  │ Avg     │ Stdev │ Min     │
├───────────┼─────────┼─────────┼─────────┼────────┼─────────┼───────┼─────────┤
│ Req/Sec   │ 26      │ 26      │ 32      │ 33     │ 30.95   │ 1.86  │ 26      │
├───────────┼─────────┼─────────┼─────────┼────────┼─────────┼───────┼─────────┤
│ Bytes/Sec │ 5.36 kB │ 5.36 kB │ 6.59 kB │ 6.8 kB │ 6.38 kB │ 382 B │ 5.36 kB │
└───────────┴─────────┴─────────┴─────────┴────────┴─────────┴───────┴─────────┘

Req/Bytes counts sampled once per second.

719 requests in 20.18s, 128 kB read
```