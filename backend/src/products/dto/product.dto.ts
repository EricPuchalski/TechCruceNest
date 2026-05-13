import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export const PRODUCT_SORT_VALUES = [
  'name',
  'priceAsc',
  'priceDesc',
  'store',
  'createdAt',
  'updatedAt',
  'lastScrapedAt',
] as const;

export type ProductSort = (typeof PRODUCT_SORT_VALUES)[number];

export class ProductQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  store?: string;

  @IsOptional()
  @IsIn(PRODUCT_SORT_VALUES)
  sortBy?: ProductSort;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === '') {
      return undefined;
    }

    if (value === 'true' || value === true) {
      return true;
    }

    if (value === 'false' || value === false) {
      return false;
    }

    return value;
  })
  active?: boolean;
}

export class ProductDto {
  @IsUUID()
  id!: string;
}
