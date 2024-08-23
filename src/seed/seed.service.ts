import { Injectable, Delete } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { QueryBuilder, Repository } from 'typeorm';


@Injectable()
export class SeedService {

  constructor(

    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>

  ) {}
  
  async executeSeed() {
    await this.delete();
    const adminUser = await this.insertUsers();
    await this.insertnewProducts(adminUser);
    return 'seed executed'
  }

  private async insertUsers(){
    const Seedusers = initialData.users;

    const users: User[] = [];

    Seedusers.forEach(user => {
      users.push( this.userRepository.create(user) );
    });

    const dbuser = await this.userRepository.save(Seedusers);

    return dbuser[0];
  }

  private async delete(){
    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
    .delete()
    .where({})
    .execute();
  }

  private async insertnewProducts(user: User){ {
     await this.productsService.deleteAllProducts(); 

    const products = initialData.products;

    const insertPromises = [];

    products.forEach(product =>{
      insertPromises.push( this.productsService.create(product,user) );
    });

    await Promise.all(insertPromises);

    return true;

  }

}
}
