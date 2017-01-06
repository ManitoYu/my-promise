const promisesAplusTests = require('promises-aplus-tests')
const Promise = require('./index')
const assert = require('assert')

// const a = {
//   then: onFulfilled => {
//     onFulfilled(b)
//   }
// }

// const b = {
//   then: onFulfilled => {
//     onFulfilled('ok')
//     onFulfilled('other')
//   }
// }

// Promise.resolve('ok').then(v => a).then(v => console.log(v))

// Promise.resolve(1).then(a => console.log(1))

// Promise.resolve().then(null, () => Promise.reject('reject')).then(() => console.log(1))

// Promise.resolve(Promise.reject(2)).then(null, a => console.log(a))

// promisesAplusTests(Promise, { reporter: 'spec' }, function (err) {
// })

// const promise = Promise.resolve(1)

// promise.then(function () {
//   return 1
// }).then(function (value) {
//   assert.strictEqual(value, 1)
// })

// promise.then(function () {
//   throw 2
// }).then(null, function (reason) {
//   assert.strictEqual(reason, 2)
// })

// promise.then(function () {
//   return 3
// }).then(function (value) {
//   assert.strictEqual(value, 3)
// })

// Promise.resolve(1)
//   .then(a => console.log(a))
//   .then(a => console.log(a))
//   .then(a => console.log(a))
//   .then(a => console.log(a))


// Promise.reject().then(null, () => console.log(1)).then(null, () => console.log(2))

// var d = Promise.deferred()
// var timesCalled = [0, 0, 0]

// d.promise.then(null, () => {
//   assert.strictEqual(++ timesCalled[0], 1)
// })

// setTimeout(() => {
//   d.promise.then(null, () => {
//     assert.strictEqual(++ timesCalled[1], 1)
//   })
// }, 50)

// setTimeout(() => {
//   d.promise.then(null, () => {
//     assert.strictEqual(++ timesCalled[2], 1) // [1, 1, 1]
//   })
// }, 100)

// setTimeout(() => {
//   d.reject()
// }, 150)

// const promise = Promise.rejected()
// const promise2 = Promise.resolved()
// let firstOnFulfilledFinished = false

// promise.then(null, () => {
//   promise2.then(() => {
//     console.log(firstOnFulfilledFinished)
//   })
//   firstOnFulfilledFinished = true
// })

// Promise.resolve(1).then(function () { 'use strict'; console.log(this) })

// let defer = Promise.deferred()
// defer.promise
//   .then(a => console.log(a))
//   .then(a => console.log(a))

// defer.resolve(1)

// var d = Promise.deferred()
// var onFulfilledCalled = false

// d.promise.then(function onFulfilled() {
//   onFulfilledCalled = true
// }, function onRejected() {
//   console.log(onFulfilledCalled, false)
// })

// setTimeout(function () {
//   d.reject()
// }, 50)


// promise.then(function () {
//   return 1
// }).then(function (value) {
//   console.log(value, 1)
// })

// promise.then(function () {
//   throw 2
// }).then(null, function (reason) {
//   console.log(reason, 3)
// })

// promise.then(function () {
//   return 3
// }).then(function (value) {
//   console.log(value, 3)
// })


// const promise = Promise.resolve(1)
// promise.then(a => console.log(a))
// promise.then(a => console.log(a))
// promise.then(a => console.log(a))

/**********
1
1
1
**********/

// const promise = Promise.resolve(1).then(() => promise)
// promise.then(() => console.log(1), reason => console.log(reason))

/**********
TypeError
**********/

// Promise.resolve(1)
//   .then(() => Promise.resolve(1))
//   .then(a => console.log(a))

// let x = 0

// const a = {}
// Object.defineProperty(a, 'then', {
//   get: () => {
//     x ++
//     return onFulfilled => onFulfilled()
//   }
// })

// Promise.resolve()
//   .then(() => a)
//   .then(() => console.log(x))

/**********
1
**********/

// const a = {
//   then: (resolvePromise) => {
//     setTimeout(() => { throw 2 }, 0)
//   }
// }

// Promise.resolve().then(() => a).then(a => console.log(a), e => console.log(e))

// Boolean.prototype.then = () => {}
// Promise.resolve(1).then(() => true).then(a => console.log(a))


// const d = Promise.deferred()
// setTimeout(() => d.resolve(1), 50)

// const a = {
//   then: onFulfilled => {
//     onFulfilled(d.promise)
//     throw 2
//   }
// }

// Promise.resolve().then(() => a).then(v => console.log(v))

let numberOfTimesThenRetrieved = 0
const a = Object.create(null, {
  then: {
    // get: function () {
    //   if (numberOfTimesThenRetrieved === 0) {
    //     ++ numberOfTimesThenRetrieved
    //     return function (onFulfilled, onRejected) {
    //       onRejected(2)
    //     }
    //   }
    //   return null
    // }
    get: () => {
      throw 3
    }
  }
})

const b = {
  then: (onFulfilled, onRejected) => {
    setTimeout(() => onFulfilled(a))
  }
}

Promise.resolve({ sentinel: 'sentinel' }).then(() => b).then(v => console.log(1, v), e => e).then(v => console.log(v))