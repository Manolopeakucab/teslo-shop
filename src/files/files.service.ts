import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';


@Injectable()
export class FilesService {
 

    async getPublicProductImage(imageName: string) {
        const path = join(__dirname,'../../public/products', imageName);
        
        if (!existsSync(path)) 
            throw new BadRequestException(`Image not found with image ${imageName}`);
        
        return path
    }

}