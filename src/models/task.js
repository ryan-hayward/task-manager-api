const mongoose = require('mongoose')
const validator = require('validator')

//task model
const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isAlpha(value)) {
                throw new Error('Invalid Name')
            }
        }
    }, 
    completed: {
        type: Boolean,
        required: false,
        default: false
    },
    owner : {
        type: mongoose.Schema.Types.ObjectId, //set up field as an object
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Task = new mongoose.model('Task', taskSchema)

module.exports = Task