import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtCookieAuthGuard } from '../auth/guards/jwt-cookie-auth.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import {
  AddFavoriteDto,
  FavoriteParamsDto,
  FavoriteQueryDto,
} from './dto/favorite.dto';
import { FavoritesService } from './favorites.service';

@Controller('users/me/favorites')
@UseGuards(JwtCookieAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findMine(@CurrentUser() user: AuthUser, @Query() query: FavoriteQueryDto) {
    return this.favoritesService.findMine(user.sub, query);
  }

  @Post()
  add(@CurrentUser() user: AuthUser, @Body() body: AddFavoriteDto) {
    return this.favoritesService.add(user.sub, body.productId);
  }

  @Delete(':productId')
  remove(@CurrentUser() user: AuthUser, @Param() params: FavoriteParamsDto) {
    return this.favoritesService.remove(user.sub, params.productId);
  }
}
