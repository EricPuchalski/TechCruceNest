import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FavoriteQueryDto } from './dto/favorite.dto';
import {
  FavoriteRemovedResponseDto,
  FavoriteResponseDto,
} from './dto/favorite-response.dto';
import { FavoriteMapper } from './mappers/favorite.mapper';
import { FAVORITE_SELECT } from './selects/favorite.select';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(
    userId: string,
    query: FavoriteQueryDto,
  ): Promise<PaginatedResponseDto<FavoriteResponseDto>> {
    const user = await this.findUserById(userId);
    const limit = Math.min(query.limit, 100);
    const skip = (query.page - 1) * limit;
    const where: Prisma.FavoriteWhereInput = { userId: user.id };

    const [items, totalItems] = await Promise.all([
      this.prisma.favorite.findMany({
        where,
        select: FAVORITE_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.favorite.count({ where }),
    ]);

    return {
      items: items.map(FavoriteMapper.toResponse),
      page: query.page,
      limit,
      totalItems,
      totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / limit),
    };
  }

  async add(userId: string, productId: string): Promise<FavoriteResponseDto> {
    const user = await this.findUserById(userId);
    await this.ensureProductExists(productId);

    const favorite = await this.prisma.favorite.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        productId,
      },
      select: FAVORITE_SELECT,
    });

    return FavoriteMapper.toResponse(favorite);
  }

  async remove(
    userId: string,
    productId: string,
  ): Promise<FavoriteRemovedResponseDto> {
    const user = await this.findUserById(userId);

    const result = await this.prisma.favorite.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Favorite not found');
    }

    return { message: 'Favorite removed' };
  }

  private async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return user;
  }

  private async ensureProductExists(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }
}
