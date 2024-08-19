import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from '../entities/user.entity';
import { JwtPayload } from "../interfaces/jwt-payload.interfaces";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JWtStrategy extends PassportStrategy( Strategy){

    constructor(@InjectRepository(User)
    private readonly userrepo:Repository<User>,
    configservice: ConfigService    ){
        super({
            secretOrKey:configservice.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
        
    }

    async validate(payload: JwtPayload):Promise<User>{

        const { id } = payload;

        const user = await this.userrepo.findOneBy({id});

        if(!user)
            throw new UnauthorizedException('User not found');

            if(!user.isActive)
                throw new UnauthorizedException('User is not active');
        
        
        return user;
    }

}