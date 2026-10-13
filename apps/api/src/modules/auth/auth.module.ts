import { Module } from "@nestjs/common";
import { JwtModule, type JwtModuleOptions } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ENV } from "../../config";

const jwtOptions = {
  global: true,
  secret: ENV.jwtSecret,
  signOptions: { expiresIn: ENV.jwtExpiresIn },
} as JwtModuleOptions;

@Module({
  imports: [JwtModule.register(jwtOptions)],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
