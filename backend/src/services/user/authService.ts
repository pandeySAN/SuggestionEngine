import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models';
import { AppError } from '../../middleware/errorHandler';
import logger from '../../config/logger';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: 'citizen' | 'volunteer' | 'admin';
  phone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  private generateToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      { id: userId, email, role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
  }

  async register(input: RegisterInput) {
    try {
      // Check if user exists
      const existingUser = await User.findOne({ where: { email: input.email } });
      if (existingUser) {
        throw new AppError(400, 'User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user
      const user = await User.create({
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role || 'citizen',
        phone: input.phone,
      });

      // Generate token
      const token = this.generateToken(user.id, user.email, user.role);

      logger.info(`User registered: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Registration error:', error);
      throw new AppError(500, 'Registration failed');
    }
  }

  async login(input: LoginInput) {
    try {
      // Find user
      const user = await User.findOne({ where: { email: input.email } });
      if (!user) {
        throw new AppError(401, 'Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(input.password, user.password);
      if (!isValidPassword) {
        throw new AppError(401, 'Invalid credentials');
      }

      // Generate token
      const token = this.generateToken(user.id, user.email, user.role);

      logger.info(`User logged in: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Login error:', error);
      throw new AppError(500, 'Login failed');
    }
  }

  async getProfile(userId: string) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to fetch profile');
    }
  }
}

export default new AuthService();