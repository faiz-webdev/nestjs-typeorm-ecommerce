import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { IResponseHandlerParams } from 'src/interfaces';
import { ResponseHandlerService } from 'src/services';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrdersProductsEntity } from './entities/orders-products.entity';
import { ShippingEntity } from './entities/shipping.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderedRepository: Repository<OrderEntity>,
    @InjectRepository(OrdersProductsEntity)
    private readonly opRepository: Repository<OrdersProductsEntity>,
    private readonly productService: ProductsService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    currentUser: UserEntity,
  ): Promise<IResponseHandlerParams> {
    try {
      const shippingEntity = new ShippingEntity();
      Object.assign(shippingEntity, createOrderDto.shippingAddress);

      const orderEntity = new OrderEntity();
      orderEntity.shippingAddress = shippingEntity;
      orderEntity.user = currentUser['data']?.id;

      const orderTbl = await this.orderedRepository.save(orderEntity);

      const opEntity: {
        order: OrderEntity;
        product: ProductEntity;
        product_quantity: number;
        product_unit_price: number;
      }[] = [];

      for (let i = 0; i < createOrderDto.orderedProducts.length; i++) {
        const order = orderTbl;
        const product = await this.productService.findOne(
          createOrderDto.orderedProducts[i].id,
        );

        if (product['data'].length < 1) {
          return ResponseHandlerService({
            success: true,
            httpCode: HttpStatus.OK,
            message: 'Product not found',
          });
        }

        const product_quantity =
          createOrderDto.orderedProducts[i].product_quantity;
        const product_unit_price =
          createOrderDto.orderedProducts[i].product_unit_price;

        opEntity.push({
          order,
          product: product['data'],
          product_quantity,
          product_unit_price,
        });
      }

      const op = await this.opRepository
        .createQueryBuilder()
        .insert()
        .into(OrdersProductsEntity)
        .values(opEntity)
        .execute();

      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Order added successfully',
        data: await this.findOne(orderTbl.id),
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
    return `This action returns all orders`;
  }

  async findOne(id: number): Promise<IResponseHandlerParams> {
    try {
      const res = await this.orderedRepository.findOne({
        where: { id: id },
        relations: {
          shippingAddress: true,
          user: true,
          products: { product: true },
        },
      });

      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Product found',
        data: res,
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

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
