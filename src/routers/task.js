const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

//post call to create a new task
router.post('/tasks', auth, async (req,res) => {
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


//get a task by id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        // can only fetch a task you own
        const task = await Task.findOne({_id, owner: req.user._id})

        if(!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

//get tasks?completed=true
//get tasks?limit=n&skip=m
//get tasks?sortBy=createdAt_desc or asc
router.get('/tasks', auth, async (req, res) => {
    const match = {} //for completed matches
    const sort = {} //to get sorting details

    //check to see if there was a query param for completed
    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1  //ternary operator example
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match, //shorthand. Can use match: match or match: { xyz }
            options: { //used for pagination and sorting within populate
                limit: parseInt(req.query.limit), //parseInt converts strings to numbers (only limits when # is provided)
                skip: parseInt(req.query.skip),
                sort //shorthand. Can use sort: sort or sort: { xyz }
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

//update tasks
router.patch('/tasks/:id', auth, async (req, res) => {
    //prevent non-valid updates
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name", "completed", "owner"]
    const isValid = updates.every((update) => allowedUpdates.includes(update))
    //throw an error if isValid is false
    if (!isValid) {
        return res.status(400).send({error: "Invalid Updates"})
    }

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)

    } catch (e) {
        res.status(400).send(e)
    }

})

//delete tasks
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if(!task){
            return res.status(404).send()
        }

        res.status(201).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router