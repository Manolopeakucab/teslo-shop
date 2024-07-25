import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { filefilter } from './fileFilter.helper';
import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('File',{
    fileFilter: filefilter,

    storage: diskStorage({
      destination: './public/upload'
    })
  }))
    
  uploadimage(
    @UploadedFile() file: Express.Multer.File,){

     if(!file){
      throw new BadRequestException('No file uploaded');
     }



  }

}
