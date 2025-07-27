import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpStatus,
  UsePipes,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, registerPipe } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { getCookieOptions } from '../common/utils/helpers';
import { ConfigService } from '@nestjs/config';
import { Roles } from '../common/decorators/role.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/role.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @UsePipes(registerPipe)
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const { accessToken, refreshToken, user } =
      await this.authService.register(registerDto);
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    res.cookie('accessToken', accessToken, getCookieOptions(isProduction));
    res.cookie('refreshToken', refreshToken, getCookieOptions(isProduction));
    return res.status(HttpStatus.CREATED).json({ accessToken, user });
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { accessToken, refreshToken, user } =
      await this.authService.login(loginDto);
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    res.cookie('accessToken', accessToken, getCookieOptions(isProduction));
    res.cookie('refreshToken', refreshToken, getCookieOptions(isProduction));
    return res.status(HttpStatus.OK).json({ accessToken, user });
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Logged out successfully' });
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Missing refresh token' });
    }
    const {
      accessToken,
      refreshToken: newRefreshToken,
      user,
    } = await this.authService.refresh(refreshToken);
    return res
      .status(HttpStatus.OK)
      .json({ accessToken, refreshToken: newRefreshToken, user });
  }

  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Get('search')
  async searchUsers(@Query('email') email: string, @Res() res: Response) {
    const users = await this.authService.searchUsers(email);
    return res.status(HttpStatus.OK).json({ users });
  }
}
