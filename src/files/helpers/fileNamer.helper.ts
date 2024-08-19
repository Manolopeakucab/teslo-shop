import {v4 as uuid} from 'uuid';

export const filenamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if( !file ) return callback(new Error('No file provided'), false);

    const fileExptension = file.mimetype.split('/')[1];

    const filename = `${ uuid() }.${fileExptension}`;

    callback(null, filename);

}