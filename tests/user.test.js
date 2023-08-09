const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId, userOne, setUpDatabase } = require('./fixtures/db')

beforeEach(setUpDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Ryan',
        email: 'ryanchayward2@gmail.com',
        password: 'myPass777'
    }).expect(201)

    //Assert that the db was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Ryan',
            email: 'ryanchayward2@gmail.com'
        },
        token: user.tokens[0].token
    })
    //pw should be encryptedd
    expect(user.password).not.toBe('myPass777')
})

test('Should login an existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non-existing user', async() => {
    await request(app).post('/users/login').send({
        email: "ryanchayward2@gmail.com",
        password: "myPass777"
    }).expect(400)
})

test('Should get profile for user', async() => {
    authToken = 'Bearer ' + userOne.tokens[0].token
    await request(app)
        .get('/users/me')
        .set('Authorization', authToken)
        .send()
        .expect(200)
})

test('Should not get profile for unauthorized user', async() => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    authToken = 'Bearer ' + userOne.tokens[0].token
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', authToken)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthorized user', async () => {
    authToken = 'Bearer ' + userOne.tokens[0].token
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    authToken = 'Bearer ' + userOne.tokens[0].token
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', authToken)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')  //second arg starts from root of project
    // toEqual does not use ===; toBe does, must use toEqual when comparing objects
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))

})

test('Should update valid user fields', async() => {
    //get user
    authToken = 'Bearer ' + userOne.tokens[0].token
    await request(app)
        .patch('/users/me')
        .set('Authorization', authToken)
        .send({
            name: 'Braxton'
        })
        .expect(201)
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Braxton')
})

test('Should not update invalid user fields', async() => {
    authToken = 'Bearer ' + userOne.tokens[0].token
    await request(app)
        .patch('/users/me')
        .set('Authorization', authToken)
        .send({
            location: 'Bali'
        })
        .expect(400)
})

// afterEach(() => {
//     //this exists, also before all and after all is good
// })