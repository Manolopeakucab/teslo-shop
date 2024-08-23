import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly datasource: DataSource,

  ) {}



  async create(createProductDto: CreateProductDto, user: User) {
    
    try {
      const { images = [], ...productdetails} = createProductDto;

      const product = this.productRepository.create({
        ...productdetails,
        images: images.map( image => this.productImageRepository.create({url: image}) ),
        user,
      });
      await this.productRepository.save( product );

      return {...product, images};
      
    } catch (error) {
      this.handleDBExceptions(error);
    }


  }


async findAll( paginationDto: PaginationDto ) {

    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    })

    return products.map( product => ({
      ...product,
      images: product.images.map( image => image.url )
    }))

  }

  async findOne( term: string ) {

    let product: Product;

    if ( isUUID(term) ) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder(); 
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('product.images', 'images')
        .getOne();
    }


    if ( !product ) 
      throw new NotFoundException(`Product with ${ term } not found`);

    return product;
  }

  async findonePlain( term: string ) {
    const {images = [], ...rest} = await this.findOne( term );
    return{
      ...rest,
      images: images.map( image => image.url )
    }
  }

  async update( id: string, updateProductDto: UpdateProductDto, user:User ) {

    const {images, ...toupdate} = updateProductDto;

    const product = await this.productRepository.preload({
      id: id,
      ...toupdate,
    });

    if ( !product ) throw new NotFoundException(`Product with id: ${ id } not found`);

    const queryrunner = this.datasource.createQueryRunner();
      await queryrunner.connect();
      await queryrunner.startTransaction();




    try {

      if (images){
        await queryrunner.manager.delete(ProductImage, {product: {id: id}});

        product.images = images.map( image => this.productImageRepository.create({url: image}) );
      }

      await queryrunner.manager.save( product );

      //await this.productRepository.save( product );

      product.user = user

      await queryrunner.commitTransaction();
      await queryrunner.release();

      return this.findonePlain( id );
      
    } catch (error) {

      await queryrunner.rollbackTransaction();
      await queryrunner.release();
      this.handleDBExceptions(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne( id );
    await this.productRepository.remove( product );
    
  }


  private handleDBExceptions( error: any ) {

    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);
    
    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }

  async deleteAllProducts() {

    const query= this.productRepository.createQueryBuilder('product');

    try {

      return await query.delete().where({}).execute();
      
    } catch (error) {

      this.handleDBExceptions(error);
      
    }
    
  }

}


//puedo borrar con el queryrunner, borrando las imagenes primero y luego el producto	