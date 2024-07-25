export const filefilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if( !file ) return callback(new Error('No file provided'), false);

    const fileExptension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if( validExtensions.includes(fileExptension) ) {
        return callback(null, true);
    } 
        callback(null, false);
    }
