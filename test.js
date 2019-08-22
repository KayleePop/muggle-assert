const test = require('muggle-test')
const assert = require('./index.js')

// AssertionError tests
test('AssertionError properties should be set correctly', () => {
  const error = new assert.AssertionError({
    message: 'penguins',
    operator: '(\'v\')',
    expected: 'food',
    actual: 'snow'
  })

  assert.equal(error.name, 'AssertionError')
  assert.equal(error.message, 'penguins')
  assert.equal(error.operator, '(\'v\')')
  assert.equal(error.expected, 'food')
  assert.equal(error.actual, 'snow')
})

test('An AssertionError should be an instance of AssertionError and Error', () => {
  const error = new assert.AssertionError()

  assert(error instanceof Error, 'error should be an instance of Error')
  assert(error instanceof assert.AssertionError, 'error should be an instance of AssertionError')
})

test('stackStartFn should trim stack correctly', () => {
  let firstError
  let secondError

  function base () {
    function nested () {
      firstError = new assert.AssertionError({ stackStartFn: base })

      function nested2 () {
        secondError = new assert.AssertionError({ stackStartFn: base })
      }
      nested2()
    }
    nested()
  }
  base()

  assert.equal(firstError.stack, secondError.stack)
})
// end of AssertionError Tests

// ---------------------------

// assert() tests
test('assert() should pass if truthy', () => {
  assert(true, 'true')
  assert(10 > 2, '10 > 2')
  assert({}, '{}')
  assert([], '[]')
  assert(100, '100')
  assert('string', '\'string\'')
  assert(new Date(), 'new Date()')
})

test('assert() should throw if falsy', () => {
  assert.throws(
    () => assert(false),
    new assert.AssertionError({
      message: '<Unnamed Assert>',
      operator: 'true'
    })
  )

  assert.throws(() => assert(2 > 10), '2 < 10')
  assert.throws(() => assert(null), 'null')
  assert.throws(() => assert(undefined), 'undefined')
  assert.throws(() => assert(0), '0')
  assert.throws(() => assert(NaN), 'NaN')
  assert.throws(() => assert(''), 'empty string')
})

test('assert() should include custom message in AssertionError', () => {
  assert.throws(
    () => assert(false, 'custom message'),
    new assert.AssertionError({
      message: 'custom message',
      operator: 'true'
    })
  )
})
// end of assert() tests

// ---------------------------

// assert.equal() tests
test('.equal() should pass if equal', () => {
  assert.equal('string', 'string')
  assert.equal(100, 100)
  assert.equal(Infinity, Infinity)
  assert.equal(null, null)
  assert.equal(undefined, undefined)
  assert.equal(false, false)
  assert.equal(true, true)

  assert.equal([1, 2, 3], [1, 2, 3])
  assert.equal({ a: 'a', b: 'b', c: 'c' }, { c: 'c', b: 'b', a: 'a' })
  assert.equal(Buffer.from('012345'), Buffer.from('012345'))
  assert.equal(new Set([1, 1, 2, 3]), new Set([1, 2, 2, 3]))
  assert.equal(new Map([[1, 'first'], [2, 'second']]), new Map([[1, 'first'], [2, 'second']]))
})

test('.equal() should throw if not equal', () => {
  assert.throws(
    () => assert.equal('actual', 'expected'),
    new assert.AssertionError({
      message: 'should be equal',
      actual: 'actual',
      expected: 'expected',
      operator: 'deepEqual'
    }),
    'should throw correctly formatted error with inequal strings'
  )

  assert.throws(() => assert.equal(100, -50), 'numbers')
  assert.throws(() => assert.equal(Infinity, -Infinity), 'positive and negative Infinity')
  assert.throws(() => assert.equal(true, false), 'true and false')

  assert.throws(() => {
    assert.equal(
      { key: 'value' },
      { key: 'other value' }
    )
  }, 'objects')
  assert.throws(() => assert.equal([1, 2, 3], [3, 2, 1]), 'arrays')
  assert.throws(() => assert.equal(Buffer.from('012345'), Buffer.from('543210')), 'Buffers')
  assert.throws(() => assert.equal(new Set([1, 2, 3]), new Set([3, 2, 1])), 'Sets')
  assert.throws(() => {
    assert.equal(
      new Map([[1, 'first'], [2, 'second']]),
      new Map([[2, 'second'], [1, 'first']])
    )
  }, 'Maps')
})

test('.equal() should include custom message in AssertionError', () => {
  assert.throws(
    () => assert.equal('actual', 'expected', 'custom message'),
    new assert.AssertionError({
      message: 'custom message',
      actual: 'actual',
      expected: 'expected',
      operator: 'deepEqual'
    })
  )
})

test('.equal() should use strict equality', () => {
  assert.throws(() => assert.equal(2, '2'), '2 and \'2\'')
  assert.throws(() => assert.equal('', false), 'false and \'\'')
  assert.throws(() => assert.equal('', 0), '\'\' and 0')
  assert.throws(() => assert.equal(undefined, null), 'undefined and null')
  assert.throws(() => assert.equal(0, false), '0 and false')
  assert.throws(() => assert.equal('0', false), '\'0\' and false')
  assert.throws(() => assert.equal(1, true), '1 and true')
  assert.throws(() => assert.equal('1', true), '\'1\' and true')
})
// end of assert.equal() tests

// ---------------------------

// assert.throws() tests
test('.throws() should pass if error is thrown', () => {
  assert.throws(() => { throw new Error() })
})

test('.throws() should fail if error is not thrown', () => {
  let threw = false
  try {
    assert.throws(() => {})
  } catch (err) {
    assert.equal(err.message, 'should throw error')
    assert.equal(err.operator, 'throws')
    threw = true
  }
  assert(threw, 'should throw')
})

test('.throws() should include custom message in AssertionError', () => {
  try {
    assert.throws(() => {}, 'custom message')
  } catch (err) {
    assert.equal(err.message, 'custom message')
  }

  try {
    assert.throws(() => {}, new Error(), 'custom message')
  } catch (err) {
    assert.equal(err.message, 'custom message')
  }
})

test('.throws() should pass if thrown error matches expected', () => {
  assert.throws(
    () => { throw new Error('message') },
    new Error('message'),
    'simple error message'
  )

  const error1 = new Error('message')
  error1.actual = { string: 'penguins' }

  const error2 = new Error('message')
  error2.actual = { string: 'penguins' }

  assert.throws(
    () => { throw error1 },
    error2,
    'with added actual property'
  )
})

test('.throws() should compare message of error to expected', () => {
  const error1 = new Error('message')
  const error2 = new Error('other message')

  let threw = false
  try {
    assert.throws(() => { throw error1 }, error2)
  } catch (err) {
    assert.equal(err.actual, error1)
    assert.equal(err.expected, error2)
    threw = true
  }
  assert(threw, 'should throw')
})

test('.throws() should compare type of error to expected', () => {
  let threw = false
  try {
    assert.throws(
      () => { throw new Error('message') },
      new TypeError('message')
    )
  } catch (err) {
    threw = true
  }
  assert(threw, 'different error types should throw')
})

test('.throws() should not compare stack to expectedError', () => {
  let errorWithDifferentStack
  function func () {
    function nested () {
      errorWithDifferentStack = new Error('message')
    }
    nested()
  }
  func()

  assert.throws(
    () => { throw new Error('message') },
    errorWithDifferentStack
  )
})
// end of assert.throws() tests

// ---------------------------

// assert.rejects() tests
test('.rejects() should resolve if promise rejects', async () => {
  await assert.rejects(Promise.reject(new Error()))
})

test('.rejects() should reject if promise resolves', async () => {
  let rejected = false
  try {
    await assert.rejects(Promise.resolve())
  } catch (err) {
    assert.equal(err.message, 'promise should reject')
    assert.equal(err.operator, 'rejects')
    rejected = true
  }
  assert(rejected, 'should reject')
})

test('.rejects() should include custom message in AssertionError', async () => {
  try {
    await assert.rejects(Promise.resolve(), 'custom message')
  } catch (err) {
    assert.equal(err.message, 'custom message')
  }

  try {
    await assert.rejects(Promise.resolve(), new Error(), 'custom message')
  } catch (err) {
    assert.equal(err.message, 'custom message')
  }
})

test('.rejects() should resolve if error matches expected', async () => {
  await assert.rejects(
    Promise.reject(new Error('message')),
    new Error('message'),
    'simple error with message'
  )

  const error1 = new Error('message')
  error1.actual = { string: 'penguins' }

  const error2 = new Error('message')
  error2.actual = { string: 'penguins' }

  await assert.rejects(
    Promise.reject(error1),
    error2,
    'with added actual property'
  )
})

test('.rejects() should compare the message of the rejection error to expected', async () => {
  const error1 = new Error('message')
  const error2 = new Error('other message')

  let rejected = false
  try {
    await assert.rejects(
      Promise.reject(error1),
      error2
    )
  } catch (err) {
    assert.equal(err.actual, error1)
    assert.equal(err.expected, error2)
    rejected = true
  }
  assert(rejected, 'should reject')
})

test('.rejects() should compare type of rejection error to expected', async () => {
  let rejected = false
  try {
    await assert.rejects(
      Promise.reject(new Error('message')),
      new TypeError('message')
    )
  } catch (err) {
    rejected = true
  }
  assert(rejected, 'should return rejected promise')
})

test('.rejects() should not compare stack to expectedError', async () => {
  let errorWithDifferentStack
  function func () {
    function nested () {
      errorWithDifferentStack = new Error('message')
    }
    nested()
  }
  func()

  await assert.rejects(
    Promise.reject(new Error('message')),
    errorWithDifferentStack
  )
})
// end of assert.rejects() tests
