import { applyDecorators, UseGuards } from "@nestjs/common";
import { ValidRoles } from "../interfaces/Valid_Roles";
import { RoleProtected } from "./role-protected.decorator";
import { AuthGuard } from "@nestjs/passport";
import { UserRoleGuard } from "../guards/user-role.guard";


export function CompositionDecorator(...roles: ValidRoles[]) {

    return applyDecorators(
        RoleProtected(...roles),
        UseGuards(AuthGuard(), UserRoleGuard),
    );

}