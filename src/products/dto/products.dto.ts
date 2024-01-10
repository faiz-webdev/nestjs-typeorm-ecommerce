import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class ProductsDto {
  @Expose()
  totalProducts: number;

  @Expose()
  limit: number;

  @Expose()
  @Type(() => ProductList)
  products: ProductList[];
}

export class ProductList {
  @Expose({ name: 'product_id' })
  id: number;

  @Expose({ name: 'product_title' })
  title: string;

  @Expose({ name: 'product_description' })
  description: string;

  @Expose({ name: 'product_price' })
  price: string;

  @Expose({ name: 'product_stock' })
  stock: string;

  @Expose({ name: 'product_images' })
  @Transform(({ value }) => value.toString().split(','))
  images: string[];

  @Expose({ name: 'product_createdAt' })
  createdAt: string;

  @Expose({ name: 'product_updatedAt' })
  updatedAt: string;

  @Expose({ name: 'product_addedById' })
  addedById: string;

  @Expose({ name: 'reviewCount' })
  review: number;

  @Expose({ name: 'avgRating' })
  rating: number;

  @Exclude()
  category_title: string;

  @Exclude()
  category_id: string;

  @Exclude()
  category_description: string;

  @Exclude()
  category_createdAt: string;

  @Exclude()
  category_updatedAt: string;

  @Exclude()
  category_addedById: string;

  @Exclude()
  product_categoryId: string;

  @Transform(({ obj }) => {
    return {
      id: obj.category_id,
      title: obj.category_title,
      category_description: obj.category_description,
      createdAt: obj.category_createdAt,
      updatedAt: obj.category_updatedAt,
      addedById: obj.category_addedById,
    };
  })
  @Expose()
  category: any;
}
