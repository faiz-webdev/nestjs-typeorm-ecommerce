import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupUserDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name should be string' })
  name: string;

  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(5, { message: 'password must be at least 5 characters' })
  password: string;
}
