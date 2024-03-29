import {
  HttpStatus,
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IResponseHandlerParams } from 'src/interfaces';
import { ResponseHandlerService } from 'src/services';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { isEmpty } from 'lodash';
import { OrderStatus } from 'src/orders/enums/order-status.enum';
import dataSource from 'db/data-source';
import { ProductsDto } from './dto/products.dto';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    private readonly categoriesService: CategoriesService,
    @Inject(forwardRef(() => OrdersService))
    private readonly orderService: OrdersService,
  ) {}
  async create(
    createProductDto: CreateProductDto,
    currentUser: UserEntity,
  ): Promise<IResponseHandlerParams> {
    try {
      const category = await this.categoriesService.findOne(
        +createProductDto.categoryId,
      );

      const product = this.productRepo.create(createProductDto);
      if (isEmpty(category.data)) {
        return ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.OK,
          message: 'Category not found',
          data: {},
        });
      }
      product.category = category['data']?.id;
      product.addedBy = currentUser['data']?.id;
      console.log(currentUser['data']?.id);

      const createdProduct = await this.productRepo.save(product);

      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Product added successfully',
        data: createdProduct,
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

  async findAll(
    query: any,
  ): Promise<{ products: any[]; totalProducts; limit }> {
    try {
      let filteredTotalProductd: number;
      let limit: number;

      if (!query.limit) {
        limit = 4;
      } else {
        limit = query.limit;
      }

      // const queryBuilder = await dataSource
      //   .getRepository(ProductEntity)
      //   .createQueryBuilder('product')
      //   .leftJoinAndSelect('product.category', 'category')
      //   .leftJoin('product.reviews', 'review')
      //   .addSelect([
      //     'COUNT(review.id) AS reviewCount',
      //     'AVG(review.ratings)::numeric(10,2) AS avgRating',
      //   ])
      //   .groupBy('product.id,category.id');

      const queryBuilder = dataSource
        .getRepository(ProductEntity)
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoin('product.reviews', 'review')
        .addSelect([
          'COUNT(review.id) AS reviewCount',
          'CAST(AVG(review.ratings) AS DECIMAL(10,2)) AS avgRating',
        ])
        .groupBy('product.id,category.id');

      const totalProducts = await queryBuilder.getCount();
      let products;

      if (query.search) {
        const search = query.search;
        queryBuilder.andWhere('product.title like :title', {
          title: `%${search}%`,
        });
      }
      if (query.category) {
        queryBuilder.andWhere('category.id=:id', { id: query.category });
      }

      if (query.minPrice) {
        queryBuilder.andWhere('product.price>=:minPrice', {
          minPrice: query.minPrice,
        });
      }
      if (query.maxPrice) {
        queryBuilder.andWhere('product.price<=:maxPrice', {
          maxPrice: query.maxPrice,
        });
      }

      if (query.minRating) {
        queryBuilder.andHaving('AVG(review.ratings)>=:minRating', {
          minRating: query.minRating,
        });
      }

      if (query.maxRating) {
        queryBuilder.andHaving('AVG(review.ratings)<=:maxRating', {
          maxRating: query.maxRating,
        });
      }

      queryBuilder.limit(limit);
      if (query.offset) {
        queryBuilder.offset(query.offset);
      }
      products = await queryBuilder.getRawMany();

      // products = await this.productRepo.find({
      //   relations: { addedBy: true, category: true, reviews: true },
      //   select: {
      //     addedBy: { id: true, name: true, email: true },
      //     category: { id: true, title: true, description: true },
      //     reviews: { id: true, comment: true, ratings: true },
      //   },
      // });

      // return ResponseHandlerService({
      //   success: true,
      //   httpCode: HttpStatus.OK,
      //   message: 'Product found',
      //   data: products,
      // });
      return { products, totalProducts, limit };
    } catch (error) {
      // return ResponseHandlerService({
      //   success: false,
      //   httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
      //   message: `Unable to process your data. Please try again later`,
      //   errorDetails: error.toString(),
      // });
      console.log(error.toString());
    }
  }

  async findOne(id: number): Promise<IResponseHandlerParams> {
    try {
      const products = await this.productRepo.findOne({
        where: { id },
        relations: { addedBy: true, category: true },
        select: {
          addedBy: { id: true, name: true, email: true },
          category: { id: true, title: true, description: true },
        },
      });
      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Product found',
        data: products,
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

  async update(
    id: number,
    updateProductDto: Partial<UpdateProductDto>,
    currentUser: UserEntity,
  ): Promise<IResponseHandlerParams> {
    try {
      let product = await this.productRepo.findOne({
        where: { id },
      });
      if (!isEmpty(product)) {
        Object.assign(product, updateProductDto);
        product.addedBy = currentUser;

        if (updateProductDto.categoryId) {
          const category = await this.categoriesService.findOne(
            +updateProductDto.categoryId,
          );
          if (!isEmpty(category)) {
            product.category = category.data?.id;
          } else {
            return ResponseHandlerService({
              success: false,
              httpCode: HttpStatus.OK,
              message: 'Category not found',
              data: {},
            });
          }
        }

        product = await this.productRepo.save(product);

        return ResponseHandlerService({
          success: true,
          httpCode: HttpStatus.OK,
          message: 'Product updated successfully',
          data: product,
        });
      }
      return ResponseHandlerService({
        success: false,
        httpCode: HttpStatus.OK,
        message: 'Product not found',
        data: {},
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

  async remove(id: number): Promise<IResponseHandlerParams> {
    try {
      const category = await this.productRepo.findOneBy({ id });
      if (isEmpty(category)) {
        return ResponseHandlerService({
          success: true,
          httpCode: HttpStatus.OK,
          message: 'Product not found',
        });
      }
      const order = await this.orderService.findOneByProductId(id);
      if (!isEmpty(order)) {
        return ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.BAD_REQUEST,
          message: 'Product is in used',
        });
      }
      const deleted = await this.productRepo.delete(id);
      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Product deleted successfully',
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

  async updateStock(id: number, stock: number, status: string) {
    let product = await this.productRepo.findOne({ where: { id } });

    if (status === OrderStatus.DELIVERED) {
      product.stock -= stock;
    } else {
      product.stock += stock;
    }

    product = await this.productRepo.save(product);

    return product;
  }
}
