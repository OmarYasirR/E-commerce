const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/generateToken');
const emailService = require('./email.service');
const redisService = require('./redis.service');

class AuthService {
  async register(userData) {
    const user = new User(userData);
    await user.save();
    
    // Skip email verification in development if no email config
    if (process.env.NODE_ENV === 'production' && process.env.EMAIL_HOST) {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();
      
      try {
        await emailService.sendVerificationEmail(user, verificationToken);
      } catch (emailError) {
        console.warn('Email sending failed but user was created:', emailError.message);
        // Don't throw error - user can still login
      }
    } else {
      // Auto-verify email in development
      user.isEmailVerified = true;
      await user.save();
      console.log('Email auto-verified in development mode');
    }
    
    return user;
  }
  
  async login(email, password) {
    console.log('email:   ' + email)
    console.log('password:    ' + password)
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
      console.log('user isnt find')
      throw new ApiError(401, 'user not found');
    }
    
    if (user.isLocked()) {
      throw new ApiError(401, 'Account is locked. Please try again later');
    }
    
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      await user.incrementLoginAttempts();
      throw new ApiError(401, 'password is incorrect');
    }
    
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    await redisService.set(`refresh_token:${user._id}`, refreshToken, 30 * 24 * 60 * 60);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return { user, token, refreshToken };
  }
  
  async refreshAuthToken(refreshToken) {
    try {
      const decoded = verifyToken(refreshToken, true);
      
      const storedToken = await redisService.get(`refresh_token:${decoded.id}`);
      if (storedToken !== refreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
      }
      
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new ApiError(401, 'User not found');
      }
      
      const newToken = generateToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);
      
      await redisService.set(`refresh_token:${user._id}`, newRefreshToken, 30 * 24 * 60 * 60);
      
      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new ApiError(401, 'Invalid refresh token');
    }
  }
  
  async logout(token, userId) {
    await redisService.del(`refresh_token:${userId}`);
    await redisService.set(`blacklist:${token}`, true, 7 * 24 * 60 * 60);
  }
  
  async generatePasswordResetToken(email) {
    const user = await User.findOne({ email });
    if (!user) return null;
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save();
    
    return resetToken;
  }
  
  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }
    
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  }
  
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if(!user){
      throw new ApiError(404, 'User not found');
    }
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(401, 'Current password is incorrect');
    }
    
    user.password = newPassword;
    await user.save();  
  }
  
  async verifyEmail(token) {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      throw new ApiError(400, 'Invalid or expired verification token');
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }
  
  async resendVerificationEmail(email) {
    const user = await User.findOne({ email });
    if (!user || user.isEmailVerified) return;
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    
    await emailService.sendVerificationEmail(user, verificationToken);
  }
}

module.exports = new AuthService();