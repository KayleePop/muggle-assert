# muggle-assert

[![Greenkeeper badge](https://badges.greenkeeper.io/KayleePop/muggle-assert.svg)](https://greenkeeper.io/)
[![Travis badge](https://travis-ci.org/KayleePop/muggle-assert.svg?branch=master)](https://travis-ci.org/KayleePop/muggle-assert)
[![standard badge](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![npm](https://img.shields.io/npm/v/muggle-assert.svg)](https://www.npmjs.com/package/muggle-assert)

A simplification of node's assert for use with [muggle](https://github.com/kayleepop/muggle)

### Goals
- Predictable and simple behavior
- Simple and readable source code
- Intuitive and small API
- Encourage writing robust and readable tests
- Fully tested

### Installation
`$ npm install muggle-assert`

### Usage
Failing assertions throw an error. Passing assertions do nothing.

```js
const assert = require('muggle-assert')

assert(2 < 5, '2 should be less than 5')

assert.equal(2 + 2, 4)

assert.throws(() => { throw new Error('penguin') })

await assert.rejects(Promise.reject(new Error('penguin')))
```

### API

#### AssertionError

`new assert.AssertionError(args)`

When an assertion fails, it throws an AssertionError

```js
function outerFunction () {
  const assertError = new assert.AssertionError({
    message: 'should be a penguin',
    expected: 'penguin',
    actual: 'polar bear',
    operator: 'animal',
    stackStartFn: outerFunction
  })

  assert.equal(assertError.name, 'AssertionError')
  assert.equal(assertError.message, 'should be a penguin')
  assert.equal(assertError.expected, 'penguin')
  assert.equal(assertError.actual, 'polar bear')
  assert.equal(assertError.operator, 'animal')

  // strips stackStartFn and above from the stack trace
  assert(!assertError.stack.includes('outerFunction'))
}
```

#### Assert

`assert(expression, description)`

Assert that an expression is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy). Throws an AssertionError if `expression` is [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy).

The AssertionError has no useful information by default. I recommended always including a description using the word "should" to make the error output readable and useful.

``` js
const tux = new Penguin('Tux')
assert(tux instanceof Penguin, 'tux should be a Penguin instance')

try {
  assert(5 > 100, '5 should be greater than 100')
} catch (assertError) {
  assert.equal(assertError.message, '5 should be greater than 100')
  assert.equal(assertError.operator, 'true')
}
```

#### Equal

`assert.equal(actual, expected, description = 'should be equal')`

Assert that the two values are equivalent.

[muggle-deep-equal](https://github.com/kayleepop/muggle-deep-equal) is used to determine equality. It uses `===` to compare values, and recursively compares the values of objects and arrays. Its behavior is detailed in [its readme](https://github.com/kayleepop/muggle-deep-equal#readme).

The AssertionError provides `actual` and `expected` properties that usually give a good idea of why the assertion failed. It's still often a good idea to add a custom description using "should", especially  to differentiate multiple `assert.equal()` within the same muggle test.

```js
assert.equal('penguin', 'penguin')

assert.equal([1, 2, 3], [1, 2, 3])

assert.equal({key: 'value'}, {key: 'value'})

try {
  assert.equal(1, true, '1 should equal true')
} catch (assertError) {
  assert.equal(assertError.message, '1 should equal true')
  assert.equal(assertError.actual, 1)
  assert.equal(assertError.expected, true)
  assert.equal(assertError.operator, 'deepEqual')
}
```

#### Throws

`assert.throws(fn, [expectedError], description = 'should throw error')`

Assert that a function will throw an error. If `fn()` finishes execution without throwing an error, then the assertion fails.

`expectedError`, if present, is the error that should be thrown from the function. If an error is thrown but it doesn't equal `expectedError`, then the assertion fails.

[muggle-deep-equal](https://github.com/kayleepop/muggle-deep-equal) is used to compare the thrown error to `expectedError`. This means the error is compared as expected using `toString()`.

```js
assert.throws(() => { throw new Error() })

assert.throws(
  () => { throw new Error('penguin') },
  new Error('penguin'),
  'penguin error should be thrown'
)

// expectedError is optional
assert.throws(() => { throw new Error('penguin') }, 'penguin error should be thrown')

try {
  assert.throws(
    () => { throw new Error('penguin') },
    new TypeError('penguin'),
    'should throw penguin TypeError'
  )
} catch (assertError) {
  assert.equal(assertError.message, 'should throw penguin TypeError')
  assert.equal(assertError.actual, new Error('penguin'))
  assert.equal(assertError.expected, new TypeError('penguin'))
  assert.equal(assertError.operator, 'throws')
}
```

#### Rejects

`async assert.rejects(promise, [expectedError], description = 'promise should reject')`

Assert that a promise is rejected or will reject.

If `promise` resolves, then the assertion fails. `assert.rejects()` is an async function, so it returns a rejected promise with an AssertionError as the reason instead of throwing on failure.

`expectedError`, if present, is the error that the promise should reject with. If the promise rejects with an error that doesn't equal `expectedError`, then the assertion fails.

[muggle-deep-equal](https://github.com/kayleepop/muggle-deep-equal) is used to compare the rejection reason to `expectedError`. This means errors are compared as expected using `toString()`.

```js
await assert.rejects(Promise.reject(new Error()))

await assert.rejects(
  Promise.reject(new Error('penguin')),
  new Error('penguin'),
  'should reject with penguin error'
)

// expectedError is optional
await assert.rejects(Promise.reject(new Error('penguin')), 'should reject with penguin error')

async function delayReject() {
  await sleep(100)
  throw new Error()
}

// async functions return promises
await assert.rejects(delayReject())

try {
  await assert.rejects(
    Promise.reject(new Error()),
    new Error('penguin'),
    'should reject with penguin error'
  )
} catch (assertError) {
  assert.equal(assertError.message, 'should reject with penguin error')
  assert.equal(assertError.actual, new Error())
  assert.equal(assertError.expected, new Error('penguin'))
  assert.equal(assertError.operator, 'rejects')
}
```
