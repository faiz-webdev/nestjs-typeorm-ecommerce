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

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
