import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ResponseHandlerService } from 'src/services';
import { IResponseHandlerParams } from 'src/interfaces';
import { SignupUserDto } from './dto/signup-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async signup(signupUserDto: SignupUserDto): Promise<IResponseHandlerParams> {
    try {
      let user = await this.finduserByEmail(signupUserDto.email);
      if (user) {
        return ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.OK,
          message: 'User already exists',
          data: user,
        });
      }
      user = this.userRepo.create(signupUserDto);
      user = await this.userRepo.save(user);
      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Event show preview has been updated',
        data: user,
      });
    } catch (error) {
      return ResponseHandlerService({
        success: false,
        httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Unable to process your data. Please try again later`,
        errorDetails: error.toString(),
      });
    }
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async finduserByEmail(email: string) {
    const user = await this.userRepo.findOneBy({ email });
    return user;
  }
}
