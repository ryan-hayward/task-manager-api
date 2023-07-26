const express = require('express')
require('./db/mongoose')
const multer = require('multer')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const qs = require('qs')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
const port = process.env.PORT

// //express middleware to disable certain things
// app.use((req, res, next) => {
//     if(req.method === "GET") {
//         res.status(400).send("GET requests disabled.")
//     } else {
//         //need to call next to move out of this method
//         next()
//     }
// })

//express maintenance mode middleware
// app.use((req, res, next) => {
//     res.status(503).send("Site currently under maintenance. Check back in soon.")
// })

//handle incoming json
app.use(express.json())

//route to different files
app.use(userRouter)
app.use(taskRouter)

//express middleware allows us to get a request -> do something -> run the route handler

//app settings to receive a complete query string and parse into KVs
app.set('query parser', (str) => {
    return qs.parse(str)
})

app.listen(port, () => {
    console.log('Server is up and running on port ' + port)
})

const Task = require('./models/task')
const User = require('./models/user')

// //Demo to populate a user object via a reference on task
// const main = async () => {
//   try {
//     const user = await User.findById('64b809a89f09269be9627d4d')
//     await user.populate('tasks').execPopulate()
//   } catch (e) {
//     console.log(e)
//   }
  
// }

// main()

////hashing with bcrypt
// const myFunction = async () => {
//     const password = 'Red12345!'
//     // eight hashes recommended to prevent hacking
//     const hashedPassword = await bcrypt.hash(password, 8)

//     console.log(password)cc
//     console.log(hashedPassword)

//     //use to compare input to hash
//     const isMatch = await bcrypt.compare(password, hashedPassword)
//     console.log(isMatch)
// }
//

////Messing with tokens
// const myFunction = async () => {
//   //set the token up with the user ID and the secret
//   const token = jwt.sign({_id: 'abc123'}, 'abcde')
//   console.log(token)

//   //verify with the token and the secret
//   const data = jwt.verify(token, 'abcde')
//   console.log(data)
// }

// myFunction()