import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShippingDto {
  @IsNotEmpty({ message: 'Phone cannot be blank' })
  @IsString({ message: 'Phone format should be string' })
  phone: string;

  @IsOptional()
  @IsString({ message: 'Name should be string' })
  name: string;

  @IsNotEmpty({ message: 'Address cannot be blank' })
  @IsString({ message: 'Address should be string' })
  address: string;

  @IsNotEmpty({ message: 'City cannot be blank' })
  @IsString({ message: 'City should be string' })
  city: string;

  @IsNotEmpty({ message: 'Post code cannot be blank' })
  @IsString({ message: 'Post code should be string' })
  postCode: string;

  @IsNotEmpty({ message: 'State cannot be blank' })
  @IsString({ message: 'State should be string' })
  state: string;

  @IsNotEmpty({ message: 'Country cannot be blank' })
  @IsString({ message: 'Country should be string' })
  country: string;
}
