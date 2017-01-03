const bluebird = require('bluebird')

class Promise {
  constructor(fn) {
    // 当前Promise状态
    this.status = Promise.status.PENDING
    this.value = null

    // then队列
    this.callbacks = []

    this.resolve = this.resolve.bind(this)
    this.reject = this.reject.bind(this)

    // EventLoop
    setTimeout(() => fn(this.resolve, this.reject))
  }

  resolve(value) {
    this.value = value

    // 第一个then出列
    const then = this.callbacks.shift()

    // 没有then，则该Promise完成
    if (! then) {
      this.status = Promise.status.RESOLVED
      return
    }

    // 调用then，获取返回值
    let nextValue = null
    try {
      nextValue = then.fulfilled(value)
    } catch (e) {
      rejected(e)
    }

    // 如果返回值是一个Promise
    if (Promise.isPromise(nextValue)) {
      // 等待另一个Promise完成后，再调用当前Promise的操作
      return nextValue.then(this.resolve, this.reject)
    }

    // 继续传递该值给队列中下一个then
    return this.resolve(nextValue)
  }

  reject(error) {
    this.status = Promise.status.REJECTED
    this.value = error
    throw new Error(error)
  }

  then(fulfilled, rejected) {
    this.callbacks.push({ fulfilled, rejected })

    return this
  }
}

// Promise状态常量
Promise.status = {
  PENDING: 0, // 等待
  RESOLVED: 1, // 成功
  REJECTED: 2 // 失败
}

Promise.isPromise = value => Object(value).then != undefined

Promise.resolve = value => {
  if (Promise.isPromise(value)) return value
  return new Promise((resolve, reject) => setTimeout(() => resolve(value)))
}

Promise.reject = error => new Promise((resolve, reject) => reject(error))

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

const time = () => new Promise((resolve, reject) => {
  setTimeout(() => resolve(1), 1000)
})

// Promise.resolve()
//   .then(() => console.log(1))
//   .then(time)
//   .then(() => console.log(2))
//   .then(time)
//   .then(() => console.log(3))
//   .then(time)

// Promise.all([time(), time(), time()]).then(values => console.log(values))

Promise.assign({
  1: time(),
  2: time(),
  3: time(),
  4: Promise.resolve(1),
  5: bluebird.delay(3000, 2) // 兼容Bluebird的Promise
})
.then(object => console.log(object))

