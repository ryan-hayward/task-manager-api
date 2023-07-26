const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

//user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, 
    age: {
        type: Number
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error ("Please enter a valid email address.")
            }
        }
    },
    password : {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (validator.contains(value, "password")) {
                throw new Error("Password cannot contain the word Password")
            }
        }  
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

//Set up a virtual property (relationship) between two tasks. NOT STORED IN THE DATABASE
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id', //match to owner from user
    foreignField: 'owner' //owner from task model
})

//method methods are accessable on the instances
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

//delete private info from being visible to a user
userSchema.methods.toJSON = function() {
    const userObj = this.toObject()
    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar
    return userObj
}

//static methods are accessable on the model itself
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    //throw error if no user
    if(!user) {
        throw new Error('Unable to login')
    }
    //check if provided password is a match
    const isMatch = await bcrypt.compare(password, user.password)
    //throw error if no match
    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

//Middleware to hash plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this  //store "this" user in user
    //hash the password if modified
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next() //call next at the end always
})

//Middleware to delete user tasks upon deletion of user
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

//user model
const User = new mongoose.model('User', userSchema)

module.exports = User