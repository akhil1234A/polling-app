import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './JwtPayload';
import { User } from './schemas/auth.schema';
import { AppLogger } from '../common/logger/logger.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.authRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.authRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: 'user',
    });
    this.logger.log(`User created: ${user.email}`);
    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.authRepository.findByEmail(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      );
      const user = await this.authRepository.findById(payload.id);
      if (!user) throw new UnauthorizedException('Invalid token');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.generateTokens(user).accessToken;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: User) {
    const payload: JwtPayload = {
      id: user.id || '',
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
    });
    return { accessToken, refreshToken };
  }
}
