## Measuring heavy CPU load in Node

The goal is to get a general idea about Node's ability to handle a heavy CPU load and determine the best way to handle upcoming requests when working with heavy CPU operations

[Fastify](https://www.fastify.io) is used as a server framework

Performance measured with [autocannon](https://www.npmjs.com/package/autocannon)

### Test benches

 - PC: i3-4160 (2 cores / 4 threads), 8GB of DDR3 RAM

 - MBP: *TBD*

### Measurements

#### 1. Simple server

A simple server that uses 1 core / 1 process / 1 thread to handle all incoming requests

- MBP

```text
// autocannon -c 100 -d 20 http://localhost:5001

TODO: measure
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

TODO: measure
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

TODO: measure
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

A server where a new Worker Thread is launched every time request hits the server (i. e. request handler function is running), this affects the perfomance since lots of new threads are created to handle incoming requests

All of these threads are bound to a single process

The idea here is that thread context switching is done much faster than the process context switching

- MBP

```text
// autocannon -c 100 -d 20 http://localhost:5001

TODO: measure
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
