const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User.model');

describe('Auth Integration Tests', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'Password123'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('email', userData.email);
    });
    
    it('should not register user with existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@test.com',
        password: 'Password123'
      };
      
      await User.create(userData);
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'login@test.com',
          password: 'Password123'
        });
    });
    
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@test.com',
          password: 'Password123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });
    
    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@test.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});