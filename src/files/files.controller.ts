import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {filefilter,filenamer} from './helpers/index';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService,
    private readonly configservice: ConfigService,
  ) {}
 

  @Get('product/:imagename')
  async findOneImage(
    @Res() res: Response,
    @Param('imagename') imageName:string) {

    const path = await this.filesService.getPublicProductImage(imageName);

    return res.sendFile(path) ;

  }


  @Post('product')
  @UseInterceptors(FileInterceptor('File',{
    fileFilter: filefilter,

    storage: diskStorage({
      destination: './public/products',
      filename: filenamer
    })
  }))
    
  uploadimage(
    @UploadedFile() File: Express.Multer.File,){

     if(!File){
      throw new BadRequestException('No file uploaded');
     }
      
        const secureURl = `${this.configservice.get('HOST_API')}/public/products${File.filename}}`;

      return {secureURl};

  }

}
