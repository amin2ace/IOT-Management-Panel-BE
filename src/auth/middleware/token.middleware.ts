import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Blacklist } from "../repository/blacklist.entity";
import { Repository } from "typeorm";

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Blacklist)
    private readonly blacklistRepo: Repository<Blacklist>,
    private readonly jwtService: JwtService
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException("Unauthorized");
    }

    const bearer = authorization.split(" ");
    const token = bearer[1];

    if (!token) {
      throw new UnauthorizedException("Token not found");
    }

    const tokenBlocked = await this.blacklistRepo.findOne({
      where: {
        token,
      },
    });

    if (tokenBlocked) {
      throw new UnauthorizedException("Token blocked");
    }

    const payload = await this.jwtService.verifyAsync(token);

    if (!payload) {
      throw new UnauthorizedException("Invalid token");
    }
    req["userId"] = payload["sub"];

    next();
  }
}
