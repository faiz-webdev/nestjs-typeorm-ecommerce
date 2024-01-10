import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
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
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { isEmpty } from 'lodash';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrdersProductsEntity)
    private readonly opRepository: Repository<OrdersProductsEntity>,
    @Inject(forwardRef(() => ProductsService))
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

      const orderTbl = await this.orderRepository.save(orderEntity);

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

  async findAll() {
    try {
      const res = await this.orderRepository.find({
        relations: {
          shippingAddress: true,
          user: true,
          products: { product: true },
        },
      });
      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Order records found',
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

  async findOne(id: number): Promise<IResponseHandlerParams> {
    try {
      const res = await this.orderRepository.findOne({
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

  async update(
    id: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
    currentUser: UserEntity,
  ): Promise<IResponseHandlerParams> {
    try {
      let order = await this.orderRepository.findOne({
        where: { id: id },
        relations: {
          products: { product: true },
        },
      });

      if (isEmpty(order)) {
        return ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.NOT_FOUND,
          message: 'Order not found',
          data: {},
        });
      }

      if (
        order.status === OrderStatus.DELIVERED ||
        order.status === OrderStatus.CANCELLED
      ) {
        return ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.NOT_FOUND,
          message: `Order already ${order.status}`,
          data: {},
        });
      }

      if (
        order.status === OrderStatus.PROCESSING &&
        updateOrderStatusDto.status != OrderStatus.SHIPPED
      ) {
        return ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.NOT_FOUND,
          message: `Delivery before shipped`,
          data: {},
        });
      }

      if (
        updateOrderStatusDto.status === OrderStatus.PROCESSING &&
        order.status === OrderStatus.SHIPPED
      ) {
        return ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.NOT_FOUND,
          message: `Order data`,
          data: order,
        });
      }

      if (updateOrderStatusDto.status === OrderStatus.SHIPPED) {
        order.shippedAt = new Date();
      }

      if (updateOrderStatusDto.status === OrderStatus.DELIVERED) {
        order.deliveredAt = new Date();
      }

      order.status = updateOrderStatusDto.status;
      order.updatedBy = currentUser['data'];
      order = await this.orderRepository.save(order);

      if (updateOrderStatusDto.status === OrderStatus.DELIVERED) {
        await this.stockUpdate(order, OrderStatus.DELIVERED);
      }

      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Product found',
        data: order,
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

  async cancelledOrder(
    id: number,
    currentUser: UserEntity,
  ): Promise<IResponseHandlerParams> {
    try {
      let order = await this.orderRepository.findOne({
        where: { id: id },
        relations: {
          products: { product: true },
        },
      });

      if (isEmpty(order)) {
        return ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.NOT_FOUND,
          message: 'Product found',
          data: {},
        });
      }
      if (order.status === OrderStatus.CANCELLED) {
        return ResponseHandlerService({
          success: true,
          httpCode: HttpStatus.OK,
          message: 'Your order already canceled',
          data: order,
        });
      }

      order.status = OrderStatus.CANCELLED;
      order.updatedBy = currentUser['data'];
      order = await this.orderRepository.save(order);
      await this.stockUpdate(order, OrderStatus.CANCELLED);

      return ResponseHandlerService({
        success: true,
        httpCode: HttpStatus.OK,
        message: 'Your order has been canceled',
        data: order,
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

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async stockUpdate(order: OrderEntity, status: string) {
    for (const op of order.products) {
      await this.productService.updateStock(
        op.product.id,
        op.product_quantity,
        status,
      );
    }
  }

  async findOneByProductId(id: number) {
    return await this.opRepository.findOne({
      where: { product: { id } },
      relations: {
        product: true,
      },
    });
  }
}
