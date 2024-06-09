import { PageDto } from '@core/pagination/dto/page.dto';
import { User } from '@database/typeorm/entities';
import { AuthCredentialDto } from '@modules/auth/dto/auth-credential.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageMetaDto } from '@core/pagination/dto/page-meta.dto';
import { PageOptionsDto } from '@core/pagination/dto/page-option.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<User>> {
    const queryBuilder = this.userRepository.createQueryBuilder('users');

    queryBuilder
      .select(['users.name', 'users.id', 'users.email'])
      .orderBy('users.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.page_size);

    const itemCount = await queryBuilder.getCount();
    const data = await queryBuilder.getMany();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(data, pageMetaDto);
  }

  async getMe(id: number): Promise<Partial<User>> {
    const foundUser = await this.userRepository.findOneByOrFail({ id });
    delete foundUser.password;
    return foundUser;
  }

  async createOne(data: User | AuthCredentialDto): Promise<User> {
    const isUserExisted = await this.userRepository.findOneBy({
      email: data.email,
    });
    if (isUserExisted) {
      throw new ConflictException('User is existed');
    }
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async updateOne(id: number, data: Partial<User>): Promise<User> {
    return this.userRepository.save(
      this.userRepository.create({
        id,
        ...data,
      }),
    );
  }

  async findOneById(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  async findOne(options: Record<string, any>): Promise<User> {
    return this.userRepository.findOneBy(options);
  }
}
