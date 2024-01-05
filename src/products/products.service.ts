import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IResponseHandlerParams } from 'src/interfaces';
import { ResponseHandlerService } from 'src/services';

@Injectable()
export class ProductsService {
  async create(
    createProductDto: CreateProductDto,
  ): Promise<IResponseHandlerParams> {
    try {
      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Category added successfully',
        data: createProductDto,
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
