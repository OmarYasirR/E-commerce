const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const emailService = require('../services/email.service');

const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  
  const existingUser = await userService.getUserByEmail(email);
  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email');
  }
  
  const user = await authService.register({ email, password, name });
  
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  
  res.status(201).json(new ApiResponse(201, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token,
    refreshToken
  }, 'User registered successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const { user, token, refreshToken } = await authService.login(email, password);
  
  res.status(200).json(new ApiResponse(200, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    },
    token,
    refreshToken
  }, 'Login successful'));
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  
  if (!token) {
    throw new ApiError(401, 'Refresh token required');
  }
  
  const newTokens = await authService.refreshAuthToken(token);
  
  res.status(200).json(new ApiResponse(200, newTokens, 'Token refreshed successfully'));
});

const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  await authService.logout(token, req.user._id);
  
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const resetToken = await authService.generatePasswordResetToken(email);
  
  if (resetToken) {
    await emailService.sendPasswordResetEmail({ email }, resetToken);
  }
  
  res.status(200).json(new ApiResponse(200, null, 'Password reset email sent if account exists'));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  await authService.resetPassword(token, newPassword);
  
  res.status(200).json(new ApiResponse(200, null, 'Password reset successful'));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;
  
  await authService.changePassword(userId, currentPassword, newPassword);
  
  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  await authService.verifyEmail(token);
  
  res.status(200).json(new ApiResponse(200, null, 'Email verified successfully'));
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  await authService.resendVerificationEmail(email);
  
  res.status(200).json(new ApiResponse(200, null, 'Verification email sent'));
});

const googleAuth = asyncHandler(async (req, res) => {
  // Handled by Passport
});

const googleAuthCallback = asyncHandler(async (req, res) => {
  const token = generateToken(req.user._id);
  const refreshToken = generateRefreshToken(req.user._id);
  
  res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}&refreshToken=${refreshToken}`);
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  googleAuth,
  googleAuthCallback
};