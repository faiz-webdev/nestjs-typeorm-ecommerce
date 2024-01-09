import { HttpStatus, Injectable } from '@nestjs/common';
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

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    private readonly categoriesService: CategoriesService,
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

  async findAll(): Promise<IResponseHandlerParams> {
    try {
      const products = await this.productRepo.find({
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
      this.productRepo.delete(id);
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
