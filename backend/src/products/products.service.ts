import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProductQueryDto } from './dto/product.dto';
import {
  ProductDetailResponseDto,
  ProductResponseDto,
} from './dto/product-response.dto';
import { ProductMapper } from './mappers/product.mapper';
import {
  PRODUCT_DETAIL_SELECT,
  PRODUCT_LIST_SELECT,
} from './selects/product.select';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: ProductQueryDto,
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    const limit = Math.min(query.limit, 100);
    const skip = (query.page - 1) * limit;
    const where = this.buildWhereClause(query);

    const [items, totalItems] = await Promise.all([
      this.prisma.product.findMany({
        where,
        select: PRODUCT_LIST_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map(ProductMapper.toResponse),
      page: query.page,
      limit,
      totalItems,
      totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / limit),
    };
  }

  async findOne(id: string): Promise<ProductDetailResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: PRODUCT_DETAIL_SELECT,
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return ProductMapper.toDetailResponse(product);
  }

  private buildWhereClause(query: ProductQueryDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    if (query.price !== undefined) {
      where.price = query.price;
    }

    if (query.store !== undefined) {
      where.store = {
        equals: query.store,
        mode: 'insensitive',
      };
    }

    if (query.active !== undefined) {
      where.active = query.active;
    }

    return where;
  }
}
