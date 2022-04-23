# Checkpoint

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]


> Tired of always failing in life? Well, I cannot help with that. But I can help you fail less in a node application.

`checkpoint` is the ultimate flaky code helper. With modern days applications, where we must integrate with external services, which can fail, we have to figure out a way of retrying our code. We must go back to somewhere we know we where fine. We must return to a `checkpoint`.

## Install

```bash
npm install @tvergara/checkpoint
```

## Usage

```ts
import { checkpoint, retry } from '@tvergara/checkpoint';

// we define how many retries we can make
await checkpoint({ retries: 3 }, () => {
  // do some awesome stuff
  // ...
  // ...

  // this is weird, this number should not be bigger than the other
  if (someNumber < otherNumber) retry();

  try {
    // solving SAT in polinomial time
  } catch (error) {
    // this error is a flaky one, we should just retry
    retry();
  }
});
```

### Nested Checkpoints
At one point or another, we might want to set different checkpoints, and to go back to which ever checkpoint we want. We can do this by specifying a name for a specific checkpoint.

```ts
await checkpoint({ name: 'first' }, async () => {
  // doing really important stuff
  // ...

  await checkpoint({ name: 'second' }, () => {

    if (somethingHappends) {
      // something went horrible, we must go even further back
      retry('first');
    }
  });
});
```

### On Retry Callback
We might have to perfom some operations in order to come back to a useful state in order to retry our code. We can set this by using the `onRetry` callback option.

```ts
function onRetry() {
  a = 0;
}
await checkpoint({ onRetry }, () => {

  // a changes its value

  if (someThingHappends) {
     retry(); // a will start at 0 at the next try
  }
});
```

### Checkpoint Options
The checkpoint options are as followed:

```ts
{
  name: 'checkpointId', // checkpoint name to reference in retries, defaults to null
  logger: console.log, // function to log the checkpoint execution, defaults to null
  retries: 3, // how many retries are available before raising an error, defaults to 1
  onRetry: () => { // specify a callback before retrying
    // do things
  }
}
```
[build-img]:https://github.com/ryansonshine/typescript-npm-package-template/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/ryansonshine/typescript-npm-package-template/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/typescript-npm-package-template
[downloads-url]:https://www.npmtrends.com/typescript-npm-package-template
[npm-img]:https://img.shields.io/npm/v/typescript-npm-package-template
[npm-url]:https://www.npmjs.com/package/typescript-npm-package-template
[issues-img]:https://img.shields.io/github/issues/ryansonshine/typescript-npm-package-template
[issues-url]:https://github.com/ryansonshine/typescript-npm-package-template/issues
[codecov-img]:https://codecov.io/gh/ryansonshine/typescript-npm-package-template/branch/main/graph/badge.svg
[codecov-url]:https://codecov.io/gh/ryansonshine/typescript-npm-package-template
