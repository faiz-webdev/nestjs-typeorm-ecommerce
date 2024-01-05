import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { IResponseHandlerParams } from 'src/interfaces';
import { ResponseHandlerService } from 'src/services';
import { isEmpty } from 'lodash';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    currentUser: UserEntity,
  ): Promise<IResponseHandlerParams> {
    try {
      let category = this.categoryRepo.create(createCategoryDto);
      category.addedBy = currentUser['data'];

      category = await this.categoryRepo.save(category);
      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Category added successfully',
        data: category,
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
      const categories = await this.categoryRepo.find();

      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Record found',
        data: categories,
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
      // const category = await this.categoryRepo.findOneBy({ id });
      const category = await this.categoryRepo.findOne({
        where: { id },
        relations: { addedBy: true },
        select: {
          addedBy: { id: true, name: true, email: true },
        },
      });
      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Record found',
        data: category,
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
    fields: Partial<UpdateCategoryDto>,
  ): Promise<IResponseHandlerParams> {
    try {
      const category = await this.categoryRepo.findOne({ where: { id } });
      // const category = await this.findOne(id);
      // console.log(category)
      if (!isEmpty(category)) {
        Object.assign(category, fields);
        const updateCategory = await this.categoryRepo.save(category);
        // console.log(category);
        return ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.OK,
          message: 'Category updated successfully',
          data: updateCategory,
        });
      } else {
        return ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.OK,
          message: 'Category not found',
          data: {},
        });
      }
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
      const category = await this.categoryRepo.findOneBy({ id });
      if (isEmpty(category)) {
        return ResponseHandlerService({
          success: true,
          httpCode: HttpStatus.OK,
          message: 'Category not found',
        });
      }
      this.categoryRepo.delete(id);
      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Category deleted successfully',
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
}
