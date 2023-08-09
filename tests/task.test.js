const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {userOne, userTwo, setUpDatabase, taskOne} = require('./fixtures/db')

beforeEach(setUpDatabase)

test('Should create task for user', async () => {
    authToken = 'Bearer ' + userOne.tokens[0].token
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', authToken)
        .send({
            name: 'test'
        })
        .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

test('Should get all tasks for userOne', async () => {
    authToken = 'Bearer ' + userOne.tokens[0].token
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', authToken)
        .send()
        .expect(200)
    expect(response.body.length).toBe(2)
})

test('Test delete task security', async () => {
    authToken = 'Bearer ' + userTwo.tokens[0].token
    const response = await request(app)
        .delete('/tasks/' + taskOne._id)
        .set('Authorization', authToken)
        .send()
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})