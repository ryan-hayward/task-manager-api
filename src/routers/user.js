const express = require('express')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendCancelEmail} = require('../emails/account')

//sign up
router.post('/users', async (req,res) => {
    const user = new User(req.body)
    
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

//log in
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user , token})
    } catch (e) {
        res.status(400).send(e)
    }
})

//log out
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

const upload = multer({
    // dest: 'src/avatars', //removing dest causes multer to pass validated data through in the function
    limits: {
        fileSize: 1000000 //equivalent to 1MB (1 million bytes)
    },
    fileFilter(req, file, cb) {  //request, file being uploaded, callback func
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
        return cb(new Error('Please upload a picture'))
        } 
        cb(undefined, true)
        
    // cb(new Error('Invalid file extension.')) //throw error
    // cb(undefined, true)  //accept file
    // cb(undefined, false) //silently reject file
    }
  })

//Avatar upload. NOTE: auth should be before other middleware args 
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    //convert to png and resize
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {  //this call signature MUST BE USED to let express know it is error handling
    res.status(400).send({error: error.message})
})

//delete an avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    console.log("gettting here")
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

//fetch avatar for any user by ID
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        //if no user or no user avatar
        if (!user | !user.avatar) {
            throw new Error()
        }
        //content type is a very popular header (express often sets these automatically)
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)

    } catch(e) {
        res.status(404).send(e)
    }
})

//sample get operation for a call to 'my' account
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//update a resource
router.patch('/users/me', auth, async (req, res) => {
    //prevent non-valid updates
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name", "age", "password", "email"]
    const isValid = updates.every((update) => allowedUpdates.includes(update))
    //throw an error if isValid is false
    if (!isValid) {
        return res.status(400).send({error: "Invalid Updates"})
    }
    //try to update the user
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        //send back if valid
        res.status(201).send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }

})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router;

