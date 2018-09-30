const deepEqual = require('muggle-deep-equal')

class AssertionError extends Error {
  constructor (opts = {}) {
    super(opts.message)

    this.name = 'AssertionError'

    this.operator = opts.operator
    this.expected = opts.expected
    this.actual = opts.actual

    if (typeof Error.captureStackTrace === 'function') {
      // default to removing this constructor from the trace
      let trimStart = AssertionError
      if (typeof opts.stackStartFn === 'function') {
        trimStart = opts.stackStartFn
      }
      Error.captureStackTrace(this, trimStart)
    }
  }
}

module.exports =
function assert (condition, message = '<Unnamed Assert>') {
  if (!condition) {
    throw new AssertionError({
      message,
      operator: 'true',
      stackStartFn: assert
    })
  }
}

// default export must be set before any others
module.exports.AssertionError = AssertionError

module.exports.equal =
function equal (actual, expected, message = 'should be equal') {
  if (!deepEqual(actual, expected)) {
    throw new AssertionError({
      message,
      operator: 'deepEqual',
      actual,
      expected,
      stackStartFn: equal
    })
  }
}

module.exports.throws =
function throws (func, expectedError, message = 'should throw error') {
  // expectedError is optional
  if (typeof arguments[1] === 'string') {
    message = arguments[1]
    expectedError = undefined
  }

  let passing = false
  let actualError
  try {
    func()
  } catch (err) {
    passing = true

    actualError = err

    if (expectedError !== undefined) {
      passing = deepEqual(actualError, expectedError)

      // remove the stacks from the output
      // deepEqual doesn't compare them, so including them is confusing
      delete actualError.stack
      delete expectedError.stack
    }
  }

  if (!passing) {
    throw new AssertionError({
      message,
      operator: 'throws',
      actual: actualError,
      expected: expectedError,
      stackStartFn: throws
    })
  }
}

module.exports.rejects =
async function rejects (promise, expectedError, message = 'promise should reject') {
  // expectedError is optional
  if (typeof arguments[1] === 'string') {
    message = arguments[1]
    expectedError = undefined
  }

  let passing = false
  let actualError
  try {
    await promise
  } catch (err) {
    passing = true

    actualError = err

    if (expectedError !== undefined) {
      passing = deepEqual(actualError, expectedError)

      // remove the stacks from the output
      // deepEqual doesn't compare them, so including them is confusing
      delete actualError.stack
      delete expectedError.stack
    }
  }

  if (!passing) {
    throw new AssertionError({
      message,
      operator: 'rejects',
      actual: actualError,
      expected: expectedError,
      stackStartFn: rejects
    })
  }
}
