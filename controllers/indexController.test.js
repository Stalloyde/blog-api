const express = require('express');
const indexRouter = require('../routes/index');
const mongoose = require('mongoose');
const request = require('supertest');
const testMongoDb = require('../config/testDb');
const User = require('../models/user');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
let testDb;

beforeAll(async () => {
  testDb = await testMongoDb();
  await testDb.initializeConnection();
});

afterAll(async () => {
  await testDb.stopConnection();
});

describe('sign up routes', () => {
  test('signup post route', async () => {
    await request(app)
      .post('/signup')
      .type('form')
      .send({ username: 'abc', password: '123', confirmPassword: '123' })
      .expect(200, 'Sign up successful!');
  });

  test('signup post route - duplicate username', async () => {
    await request(app)
      .post('/signup')
      .type('form')
      .send({ username: 'abc', password: 'qwe', confirmPassword: 'qwe' })
      .expect(200, {
        usernameError: '*Username has been taken. Try another.',
        passwordError: null,
        confirmPasswordError: null,
      });
  });

  test('signup post route - non-duplicate username', async () => {
    await request(app)
      .post('/signup')
      .type('form')
      .send({ username: 'abcd', password: 'qwe', confirmPassword: 'qwe' })
      .expect(200, 'Sign up successful!');
  });
});

describe('login routes', () => {
  test('login success', async () => {
    const response = await request(app)
      .post('/login')
      .type('form')
      .send({ username: 'abc', password: '123' })
      .expect(200);

    expect(response.body).toEqual({
      username: 'abc',
      isMod: false,
      Bearer: response.body.Bearer,
    });
  });

  test('login post route - wrong password', async () => {
    await request(app)
      .post('/login')
      .type('form')
      .send({ username: 'abc', password: '12asdas3' })
      .expect(200, {
        usernameError: null,
        passwordError: '*Incorrect password',
      });
  });

  test('login post route - wrong username', async () => {
    await request(app)
      .post('/login')
      .type('form')
      .send({ username: 'abqeqwc', password: '123' })
      .expect(200, { usernameError: '*User not found', passwordError: null });
  });
});

//   test('posts route', async () => {
//     await request(app).get('/posts').expect('GET - Signup page');
//   });

//   test('posts/:id route', async () => {
//     await request(app).get('/posts/:id').expect('GET - Signup page');
//   });

//   test('posts/:id post comment route', async () => {
//     await request(app).post('/posts/:id').expect('GET - Signup page');
//   });
