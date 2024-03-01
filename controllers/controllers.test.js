const express = require('express');
const mongoose = require('mongoose');
const indexRouter = require('../routes/index');
const modRouter = require('../routes/mod');
const request = require('supertest');
const testMongoDb = require('../config/testDb');
const passport = require('../config/passport');
const isMod = require('../config/isMod');
const uploadImage = require('../config/cloudinary');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', indexRouter);
app.use('/mod', modRouter);
const req = request(app);

let testDb;
let token;
let postId;
let targetCommentId;

beforeAll(async () => {
  testDb = await testMongoDb();
  await testDb.initializeConnection();
});

afterAll(async () => {
  await testDb.stopConnection();
});

describe('sign up routes', () => {
  test('POST signup - successful signup', async () => {
    await req
      .post('/signup')
      .type('form')
      .send({
        username: 'abc',
        password: '123',
        confirmPassword: '123',
        isMod: true,
      })
      .expect(200, 'Sign up successful!');
  });

  test('POST signup - duplicate username', async () => {
    await req
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
    await req
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

describe('mod login routes', () => {
  test('POST login success', async () => {
    const response = await req
      .post('/mod/login')
      .type('form')
      .send({ username: 'abc', password: '123' })
      .expect(200);

    expect(response.body).toEqual({
      username: 'abc',
      isMod: response.body.isMod ? response.body.isMod : false,
      Bearer: response.body.Bearer,
    });

    token = response.body.Bearer;
  });

  test('POST login - wrong password', async () => {
    await req
      .post('/mod/login')
      .type('form')
      .send({ username: 'abc', password: '12asdas3' })
      .expect(200, {
        usernameError: null,
        passwordError: '*Incorrect password',
      });
  });

  test('POST login - wrong username', async () => {
    await req
      .post('/mod/login')
      .type('form')
      .send({ username: 'abqeqwc', password: '123' })
      .expect(200, { usernameError: '*User not found', passwordError: null });
  });
});

describe('client login routes', () => {
  test('POST login success', async () => {
    const response = await req
      .post('/login')
      .type('form')
      .send({ username: 'abc', password: '123' })
      .expect(200);

    expect(response.body).toEqual({
      username: 'abc',
      isMod: response.body.isMod ? response.body.isMod : false,
      Bearer: response.body.Bearer,
    });
    token = response.body.Bearer;
  });

  test('POST login - wrong password', async () => {
    await req
      .post('/login')
      .type('form')
      .send({ username: 'abc', password: '12asdas3' })
      .expect(200, {
        usernameError: null,
        passwordError: '*Incorrect password',
      });
  });

  test('POST login - wrong username', async () => {
    await req
      .post('/login')
      .type('form')
      .send({ username: 'abqeqwc', password: '123' })
      .expect(200, { usernameError: '*User not found', passwordError: null });
  });
});

describe('CRUD operations', () => {
  test('mod create first post', async () => {
    const responsePost = await req
      .post('/mod/posts')
      .set('Authorization', token)
      .type('form')
      .send({
        title: 'Mock Title',
        content: 'Mock Content',
        image: null,
        toPublish: true,
      })
      .expect(200);
    postId = responsePost.body._id;
  });

  test('mod create second post', async () => {
    await req
      .post('/mod/posts')
      .set('Authorization', token)
      .type('form')
      .send({
        title: 'Mock Title 2',
        content: 'Mock Content 2',
        image: null,
        toPublish: true,
      })
      .expect(200);
  });

  test('add first comment to first post', async () => {
    const responseNewComment = await request(app)
      .post(`/posts/${postId}`)
      .set('Authorization', token)
      .send({ newComment: 'Adding first comment for testing' });

    const commentsArray = responseNewComment.body.comments;
    expect(
      responseNewComment.body.comments[commentsArray.length - 1].content,
    ).toBe('Adding first comment for testing');
    const comments = responseNewComment.body.comments;
    targetCommentId = comments[comments.length - 1]._id;
  });

  test('add second comment to first post', async () => {
    const responseNewComment = await request(app)
      .post(`/posts/${postId}`)
      .set('Authorization', token)
      .send({ newComment: 'Adding second comment for testing' });
    const commentsArray = responseNewComment.body.comments;

    expect(
      responseNewComment.body.comments[commentsArray.length - 1].content,
    ).toBe('Adding second comment for testing');
  });

  test('mod edit post', async () => {
    const responseUpdatedPost = await req
      .put('/mod/posts')
      .set('Authorization', token)
      .type('form')
      .send({
        editId: postId,
        title: 'Edited mock title',
        content: 'Edited mock content',
        toPublish: false,
      });
    expect(responseUpdatedPost.body.title).toBe('Edited mock title');
    expect(responseUpdatedPost.body.content).toBe('Edited mock content');
    expect(responseUpdatedPost.body.isPublished).toBe(false);
  });

  test('delete first comment in first post', async () => {
    const responseDeleteComment = await req
      .del(`/mod/posts/${postId}`)
      .set('Authorization', token)
      .send({ commentId: targetCommentId });
    const commentsArray = responseDeleteComment.body.comments;
    expect(
      responseDeleteComment.body.comments[commentsArray.length - 1].content,
    ).toBe('Adding second comment for testing');
  });

  test('delete first post', async () => {
    const responseDeleteFirstPost = await req
      .del('/mod/posts')
      .set('Authorization', token)
      .send({ targetPostId: postId });

    const remainingPost = responseDeleteFirstPost.body[0];
    expect(remainingPost.title).toBe('Mock Title 2');
    expect(remainingPost.content).toBe('Mock Content 2');
  });
});
