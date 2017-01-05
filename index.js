const bluebird = require('bluebird')

class Promise {
  constructor(fn) {
    this.status = Promise.status.PENDING
    this.value = null

    this.handlers = []

    this.resolve = this.resolve.bind(this)
    this.reject = this.reject.bind(this)

    this._doResolve(fn, this.resolve, this.reject)
  }

  resolve(value) {
    // 2.3.1: If `promise` and `x` refer to the same object, reject `promise` with a `TypeError' as the reason.
    if (value == this) throw new TypeError

    // 2.3.3 `x` is an object with normal Object.prototype
    // then方法只能被访问一次，否则通过不了测试，采取变量持有引用的方式来解决
    const then = this._getThen(value)

    if (then) {
      // 2.3.2.2: If/when `x` is fulfilled, fulfill `promise` with the same value.
      // 这里需要对value进行this绑定
      return this._doResolve(then.bind(value), this.resolve, this.reject)
    }

    this.fulfill(value)
  }

  fulfill(value) {
    if (! this._isPending()) return
    setTimeout(() => {
      this._beResolved()
      this.value = value
      this.handlers.forEach(handler => handler.onFulfilled(value))
    })
  }

  reject(reason) {
    if (! this._isPending()) return
    setTimeout(() => {
      this._beRejected()
      this.value = reason
      this.handlers.forEach(handler => handler.onRejected(reason))
    })
  }

  then(onFulfilled, onRejected) {
    return new Promise((resolve, reject) => {
      this.done(value => {
        if (! this._isFunction(onFulfilled)) return resolve(value)
        try {
          return resolve(onFulfilled(value))
        } catch (e) {
          return reject(e)
        }
      }, reason => {
        if (! this._isFunction(onRejected)) return reject(reason)
        try {
          return resolve(onRejected(reason))
        } catch (e) {
          return reject(e)
        }
      })
    })
  }

  done(onFulfilled, onRejected) {
    setTimeout(() => this._handle({ onFulfilled, onRejected }))
  }

  _handle(handler) {
    switch (true) {
      case this._isPending(): this.handlers.push(handler); break
      case this._isResolved(): handler.onFulfilled(this.value); break
      case this._isRejected(): handler.onRejected(this.value); break
    }
  }

  _doResolve(fn, onFulfilled, onRejected) {
    try {
      fn(onFulfilled, onRejected)
    } catch (e) {
      onRejected(e)
    }
  }

  // utils
  _isFunction(f) {
    return typeof f == 'function'
  }

  _isPlainObject(o) {
    return typeof o == 'object' && o instanceof Object
  }

  _isBoolean(b) {
    return typeof b == 'boolean'
  }

  _isNumber(n) {
    return typeof n == 'number'
  }

  _isRejected() {
    return this.status == Promise.status.REJECTED
  }

  _isResolved() {
    return this.status == Promise.status.RESOLVED
  }

  _isPending() {
    return this.status == Promise.status.PENDING
  }

  _isEmpty(o) {
    return o == null
  }

  _beRejected() {
    this.status = Promise.status.REJECTED
  }

  _beResolved() {
    this.status = Promise.status.RESOLVED
  }

  _bePending() {
    this.status = Promise.status.PENDING
  }

  _getThen(value) {
    // 2.3.4: If `x` is not an object or function, fulfill `promise` with `x`
    if (this._isEmpty(value)) return null
    if (this._isBoolean(value)) return null
    if (this._isNumber(value)) return null
    const then = Object(value).then
    if (! this._isFunction(then)) return null
    return then
  }
}

// Promise状态常量
Promise.status = {
  PENDING: 0, // 等待
  RESOLVED: 1, // 接受
  REJECTED: 2 // 拒绝
}

Promise.isPromise = value => Object(value).then != undefined

Promise.resolve = value => {
  if (Promise.isPromise(value)) return value
  // 这里要采用定时器，否则在resolve的时候，then队列还是空的
  // 先要等所有的计算代码执行完毕，事件都注册好后，再执行事件
  return new Promise((resolve, reject) => resolve(value))
}

Promise.reject = reason => {
  if (Promise.isPromise(reason)) return reason
  return new Promise((resolve, reject) => reject(reason))
}

// 并发数组
Promise.all = promises => new Promise((resolve, reject) => {
  const finalValues = []
  let promisesCount = 0

  promises.map((p, k) => {
    if (Promise.isPromise(p)) {
      promisesCount ++ // 标记
      p.then(v => {
        promisesCount -- // 完成，标记减一
        finalValues[k] = v
        if (! promisesCount) resolve(finalValues)
      })
      return
    }

    finalValues[k] = p
  })
})

// 并发对象
Promise.assign = object => new Promise((resolve, reject) => {
  const finalObject = {}
  let promisesCount = 0

  for (let k in object) {
    if (Promise.isPromise(object[k])) {
      promisesCount ++ // 标记
      object[k].then(v => {
        promisesCount -- // 完成，标记减一
        finalObject[k] = v
        if (! promisesCount) resolve(finalObject)
      })
      continue
    }

    finalObject[k] = object[k]
  }
})

// 竞争
Promise.race = promises => new Promise((resolve, reject) => {
  promises.map(p => p.then(v => resolve(v)))
})

// const time = () => new Promise((resolve, reject) => {
//   setTimeout(() => resolve(1), 1000)
// })

// Promise.resolve()
//   .then(() => console.log(1))
//   .then(time)
//   .then(() => console.log(2))
//   .then(time)
//   .then(() => console.log(3))
//   .then(time)

// Promise.all([time(), time(), time()]).then(values => console.log(values))

// Promise.assign({
//   1: time(),
//   2: time(),
//   3: time(),
//   4: Promise.resolve(1),
//   5: bluebird.delay(3000, 2) // 兼容Bluebird的Promise
// })
// .then(object => console.log(object))


// Promise A+

Promise.deferred = () => {
  const promise = new Promise((resolve, reject) => {})

  return {
    promise,
    resolve: promise.resolve,
    reject: promise.reject
  }
}

Promise.resolved = Promise.resolve

Promise.rejected = Promise.reject

module.exports = Promise

