const express = require('express');
const indexRouter = require('../routes/index');
const mongoose = require('mongoose');
const request = require('supertest');
const testMongoDb = require('../config/testDb');
const Post = require('../models/post');

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
  test('POST signup - successful signup', async () => {
    await request(app)
      .post('/signup')
      .type('form')
      .send({ username: 'abc', password: '123', confirmPassword: '123' })
      .expect(200, 'Sign up successful!');
  });

  test('POST signup - duplicate username', async () => {
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

  test('POST signup - non-matching passwords', async () => {
    await request(app)
      .post('/signup')
      .type('form')
      .send({ username: 'abcd', password: 'qwe', confirmPassword: 'qswe' })
      .expect(200, {
        usernameError: null,
        passwordError: null,
        confirmPasswordError: '*Passwords do not match',
      });
  });
});

describe('login routes', () => {
  test('POST login success', async () => {
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

  test('POST login - wrong password', async () => {
    await request(app)
      .post('/login')
      .type('form')
      .send({ username: 'abc', password: '12asdas3' })
      .expect(200, {
        usernameError: null,
        passwordError: '*Incorrect password',
      });
  });

  test('POST login - wrong username', async () => {
    await request(app)
      .post('/login')
      .type('form')
      .send({ username: 'abqeqwc', password: '123' })
      .expect(200, { usernameError: '*User not found', passwordError: null });
  });
});

describe('posts routes', () => {
  test('GET all posts', async () => {
    const posts = await Post.find({ isPublished: true }).populate({
      path: 'comments',
      populate: { path: 'author', select: ['username', 'isMod'] },
    });
    await request(app).get('/posts').expect(posts);
  });

  test('GET specific post', async () => {
    const post = await Post.findById()
      .populate({
        path: 'comments',
        populate: { path: 'author', select: ['username', 'isMod'] },
        options: { sort: { date: -1 } },
      })
      .populate('author', 'username');
    await request(app).get('/posts').expect(post);
  });
});

//   test('posts/:id route', async () => {
//     await request(app).get('/posts/:id').expect('GET - Signup page');
//   });

//   test('posts/:id post comment route', async () => {
//     await request(app).post('/posts/:id').expect('GET - Signup page');
//   });
