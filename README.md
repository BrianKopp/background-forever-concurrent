# Background Forever Concurrent

A simple utility to run concurrent background tasks forever.

## Quick Start

```js
const { BackgroundForeverConcurrent } = require('background-forever-concurrent');

const bfConcurrent = new BackgroundForeverConcurrent(4, () => {
    return new Promise<void>((resolve, reject) => {
        console.log('hello world!');
        setTimeout(() => {
            resolve();
        }, 1000);
    });
});

bfConcurrent.start();

setTimeout(() => {
    bf.stop().then(() => {
        console.log('stopped successfully!');
    }).catch((e) => {
        console.error('error occurred while stopping the concurrent functions', e);
    });
}, 5000);
```

## Events

`BackgroundForeverConcurrent` emits a number of events which you can subscribe to.
The events are the same as in the `BackgroundForever` library, except the event values
are wrapped in an object along with a property `which` indicating which concurrent
function emitted the event.

### Before Run

`beforeRun` fires each time before calling your function. Value is like:

```js
{
    runCount: 1, // run count, starting at one
    which: 0 // which concurrent task, zero-based
}
```

### Run Success

`runSuccess` fires after your function successfully resolves its returned
promise. Value is like:

```js
{
    result: value, // background function return value
    which: 0 // which concurrent task, zero-based
}
```

### Run Error

`runError` fires if your function throws an error. The value in the event is like:

```js
{
    error: 'some error', // error emitted or promise rejection message
    which: 0 // which concurrent task, zero-based
}
```
