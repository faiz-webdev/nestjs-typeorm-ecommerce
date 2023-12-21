import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IResponseHandlerParams } from 'src/interfaces';
import { SignupUserDto } from './dto/signup-user.dto';
import { SignInUserDto } from './dto/signin-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  public async signup(
    @Body() signupUserDto: SignupUserDto,
  ): Promise<IResponseHandlerParams> {
    return this.usersService.signup(signupUserDto);
  }

  @Post('signin')
  public async signin(
    @Body() signinUserDto: SignInUserDto,
  ): Promise<IResponseHandlerParams> {
    return this.usersService.signin(signinUserDto);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  public async findAll(): Promise<IResponseHandlerParams> {
    return this.usersService.findAll();
  }

  @Get(':id')
  public async findOne(
    @Param('id') id: string,
  ): Promise<IResponseHandlerParams> {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
