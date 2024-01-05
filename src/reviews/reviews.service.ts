import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { IResponseHandlerParams } from 'src/interfaces';
import { ResponseHandlerService } from 'src/services';
import { ProductsService } from 'src/products/products.service';
import { isEmpty } from 'lodash';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepo: Repository<ReviewEntity>,
    private readonly productService: ProductsService,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    currentUser: UserEntity,
  ): Promise<IResponseHandlerParams> {
    try {
      const product = await this.productService.findOne(
        createReviewDto.productId,
      );

      if (!isEmpty(product.data)) {
        let review = await this.findOneByUserAndProduct(
          currentUser['data']?.id,
          createReviewDto.productId,
        );
        if (!review) {
          review = this.reviewRepo.create(createReviewDto);
          review.user = currentUser['data'];
          review.product = product.data;
        } else {
          review.comment = createReviewDto.comment;
          review.ratings = createReviewDto.ratings;
        }
        review = await this.reviewRepo.save(review);

        return ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.OK,
          message: 'Review added successfully',
          data: review,
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

  findAll() {
    return `This action returns all reviews`;
  }

  async findAllByProduct(id: number): Promise<IResponseHandlerParams> {
    try {
      const product = await this.productService.findOne(id);
      const review = await this.reviewRepo.find({
        where: { product: { id } },
        relations: { user: true, product: { category: true } },
        select: {
          user: { id: true, name: true, email: true },
          product: {
            id: true,
            title: true,
            description: true,
            category: { id: true, title: true, description: true },
          },
        },
      });
      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Product found',
        data: review,
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
      const review = await this.reviewRepo.findOne({
        where: { id },
        relations: { user: true, product: { category: true } },
        select: {
          user: { id: true, name: true, email: true },
          product: {
            id: true,
            title: true,
            description: true,
            category: { id: true, title: true, description: true },
          },
        },
      });
      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Product found',
        data: review,
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

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  async remove(id: number): Promise<IResponseHandlerParams> {
    try {
      const review = await this.reviewRepo.findOneBy({ id });
      if (isEmpty(review)) {
        return ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.OK,
          message: 'Review not found',
        });
      }
      this.reviewRepo.delete(id);
      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Review deleted successfully',
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

  async findOneByUserAndProduct(userId: number, productId: number) {
    return await this.reviewRepo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
      relations: {
        user: true,
        product: { category: true },
      },
    });
  }
}
