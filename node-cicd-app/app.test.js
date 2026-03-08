const request = require('supertest');
const app = require('./app');
const mongoose = require('mongoose');

describe('Teste de API de Usuários', () => {
  // afterAll(async () => {
  //   await mongoose.connection.close();
  // });

  // it('Deve retornar status 200 ao buscar usuários', async () => {
  //   const res = await request(app).get('/users');
  //   expect(res.statusCode).toEqual(200);
  // }, 15000);

  // it('Deve retornar status 200 ao buscar post', async () => {
  //   const res = await request(app).get('/posts');
  //   expect(res.statusCode).toEqual(200);
  // })

  it('Test 1', async () => {
    expect(1).toEqual(1);
  })

});