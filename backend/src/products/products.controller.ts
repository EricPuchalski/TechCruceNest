import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductDto, ProductQueryDto } from './dto/product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param() params: ProductDto) {
    return this.productsService.findOne(params.id);
  }
}
