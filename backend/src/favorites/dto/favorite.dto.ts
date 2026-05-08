import { IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FavoriteQueryDto extends PaginationDto {}

export class AddFavoriteDto {
  @IsUUID()
  productId!: string;
}

export class FavoriteParamsDto {
  @IsUUID()
  productId!: string;
}
