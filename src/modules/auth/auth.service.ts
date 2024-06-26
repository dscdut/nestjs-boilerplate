import { UserService } from '@modules/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterResponse } from './response/register.response';
import { User } from '@database/typeorm/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { CreateAuthDto } from './dto/auth-create.dto';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerUser(createAuthDto: CreateAuthDto): Promise<RegisterResponse> {
    const data = {
      name: createAuthDto.full_name,
      email: createAuthDto.email,
      password: createAuthDto.password,
    };
    const user = await this.userService.createOne(data);
    return {
      id: user.id,
      email: user.email,
      full_name: user.name,
    };
  }

  async login(body: AuthCredentialDto) {
    const user = await this.validateAndGetUser(body);
    const payload = { email: user.email, userId: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .innerJoinAndSelect('users.role', 'role')
      .where('users.id = :id', { id: userId })
      .select([
        'users.id as id',
        'users.name as name',
        'users.email as email',
        'role.name as role',
      ])
      .getRawOne();

    if (!user) throw new UnauthorizedException("PROF-104");

    return user;
  }

  async validateAndGetUser(
    authCredentialDto: AuthCredentialDto,
  ): Promise<User> {
    const { email, password } = authCredentialDto;
    const isUserExisted = await this.userRepository.findOneBy({
      email,
    });
    if (!isUserExisted) {
      throw new UnauthorizedException('LO-102');
    }

    const isValidPassword = await argon2.verify(
      isUserExisted.password,
      password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('LO-102');
    }

    return isUserExisted;
  }
}
