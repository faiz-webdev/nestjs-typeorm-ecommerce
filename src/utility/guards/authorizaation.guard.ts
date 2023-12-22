import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorizeGuard implements CanActivate {
  constructor(private refelctor: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.refelctor.get<string[]>(
      'allowedRoles',
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();

    // console.log(request.currentUser.data?.roles)
    console.log(allowedRoles);
    // const result = request.currentUser.data?.roles
    //   .map((role: string) => allowedRoles.includes(role))
    //   .find((val: boolean) => val === true);
    const result = allowedRoles.includes(request.currentUser.data?.roles);
    // console.log(result);

    if (result) return true;
    else throw new UnauthorizedException('Sorry, you are not authorized.');
    // throw new UnauthorizedException('Sorry, you are not authorized.');
  }
}
