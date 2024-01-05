import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @IsString()
  readonly title: string;

  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString()
  readonly description: string;

  @IsNotEmpty({ message: 'Price cannot be empty' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price should be number & max precision 2' },
  )
  @IsPositive({ message: 'Price should be positive number' })
  readonly price: number;

  @IsNotEmpty({ message: 'Stock should not be empty' })
  @IsNumber({}, { message: 'Stock should be number' })
  @Min(0, { message: 'Stock cannot be negative' })
  readonly stock: number;

  @IsNotEmpty({ message: 'Images should not be empty' })
  @IsArray({ message: 'Images should be in an array format' })
  readonly images: string[];

  @IsNotEmpty({ message: 'Category should not be empty' })
  @IsNumber({}, { message: 'Category id should be a number' })
  readonly category: number;
}
