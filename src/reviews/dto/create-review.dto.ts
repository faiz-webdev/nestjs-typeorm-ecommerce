import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'Product id cannot be empty' })
  @IsNumber({}, { message: 'Product id should be number' })
  productId: number;

  @IsNotEmpty({ message: 'Ratings cannot be empty' })
  @IsNumber({}, { message: 'Rating should be number' })
  ratings: number;

  @IsNotEmpty({ message: 'Comment cannot be empty' })
  @IsString()
  comment: string;
}
