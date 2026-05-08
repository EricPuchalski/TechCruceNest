import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit = 10;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page = 1;
}
