const authController = require('../../../controllers/auth.controller');
const authService = require('../../../services/auth.service');
const ApiResponse = require('../../../utils/ApiResponse');

jest.mock('../../../services/auth.service');

describe('Auth Controller', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      body: {},
      user: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User'
      };
      req.body = userData;
      
      const mockUser = { _id: '123', ...userData };
      authService.register.mockResolvedValue(mockUser);
      
      await authController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.any(ApiResponse));
    });
  });
  
  describe('login', () => {
    it('should login user successfully', async () => {
      req.body = {
        email: 'test@test.com',
        password: 'password123'
      };
      
      const mockResult = {
        user: { _id: '123', email: 'test@test.com' },
        token: 'jwt-token',
        refreshToken: 'refresh-token'
      };
      authService.login.mockResolvedValue(mockResult);
      
      await authController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(ApiResponse));
    });
  });
});