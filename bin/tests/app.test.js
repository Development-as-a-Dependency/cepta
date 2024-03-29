const app = require('../app');
const request = require('supertest');

beforeAll(async () => {
  const port = process.env.PORT || '3000';
  server = app.listen(port);
});

afterAll(() => {
  server.close();
});

test('PASS if / Route is valid', (done) => {
  request(app)
    .get('/')
    .then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
});
