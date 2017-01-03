const promisesAplusTests = require("promises-aplus-tests")
const Promise = require('./index')
// const Promise = require('bluebird')

promisesAplusTests(Promise, { reporter: 'spec' }, function (err) {
    
})

// Promise.reject().then().then(null, () => console.log(1))