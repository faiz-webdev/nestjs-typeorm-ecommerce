import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ResponseHandlerService } from 'src/services';
import { IResponseHandlerParams } from 'src/interfaces';
import { SignupUserDto } from './dto/signup-user.dto';
import { hash, compare } from 'bcrypt';
import { SignInUserDto } from './dto/signin-user.dto';

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
        });
      }
      signupUserDto.password = await hash(signupUserDto.password, 10);
      user = this.userRepo.create(signupUserDto);
      user = await this.userRepo.save(user);
      delete user.password;
      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Signup successful',
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

  async signin(signinUserDto: SignInUserDto): Promise<IResponseHandlerParams> {
    try {
      let user = await this.userRepo
        .createQueryBuilder('users')
        .addSelect('users.password')
        .where('users.email=:email', { email: signinUserDto.email })
        .getOne();
      if (user) {
        const matchedPassword = await compare(
          signinUserDto.password,
          user.password,
        );
        if (!matchedPassword) {
          return ResponseHandlerService({
            success: false,
            httpCode: HttpStatus.OK,
            message: 'User not found',
          });
        }
        return ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.OK,
          message: 'User logged in successfully',
        });
      }

      return ResponseHandlerService({
        success: false,
        httpCode: HttpStatus.OK,
        message: 'User not found',
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
