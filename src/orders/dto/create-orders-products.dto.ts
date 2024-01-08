import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class OrderedProductsDto {
  @IsNotEmpty({ message: 'Product cannot be blank' })
  @IsNumber({}, { message: 'Phone format should be string' })
  id: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price should be number & max decimal precission 2' },
  )
  @IsPositive({ message: 'Price should be positive' })
  product_unit_price: number;

  @IsNumber({}, { message: 'Product quantity should be number' })
  @IsPositive({ message: 'Quantity should be positive' })
  product_quantity: number;
}
