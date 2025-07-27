import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AppLogger } from '../common/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;
    const existingUser = await this.authRepository.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`User already exists: ${email}`);
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.authRepository.createUser({
      email,
      password: hashedPassword,
      role: 'user',
    });

    const accessToken = this.generateAccessToken(user.email, user.role);
    const refreshToken = this.generateRefreshToken(user.email);

    this.logger.log(`User registered: ${email}`);
    return {
      accessToken,
      refreshToken,
      user: { email: user.email, role: user.role },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.authRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      this.logger.warn(`Login failed for email ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user.email, user.role);
    const refreshToken = this.generateRefreshToken(user.email);

    this.logger.log(`User logged in: ${email}`);
    return {
      accessToken,
      refreshToken,
      user: { email: user.email, role: user.role },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.authRepository.findByEmail(payload.id);
      if (!user) {
        this.logger.warn('Refresh token failed: user not found');
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.generateAccessToken(user.email, user.role);
      const newRefreshToken = this.generateRefreshToken(user.email);

      this.logger.log(`Token refreshed for: ${user.email}`);
      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: { email: user.email, role: user.role },
      };
    } catch (err) {
      this.logger.error(`Refresh failed: ${err.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async searchUsers(emailPrefix: string) {
    if (!emailPrefix) {
      this.logger.warn('Missing email prefix for search');
      throw new BadRequestException('Email query required');
    }

    const users = await this.authRepository.searchByEmailPrefix(emailPrefix);
    this.logger.log(`Found ${users.length} users for prefix: ${emailPrefix}`);
    return users;
  }

  private generateAccessToken(email: string, role: string) {
    return this.jwtService.sign(
      { id: email, email, role },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES'),
      },
    );
  }

  private generateRefreshToken(email: string) {
    return this.jwtService.sign(
      { id: email },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
      },
    );
  }
}
