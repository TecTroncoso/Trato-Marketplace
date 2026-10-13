import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { SafeUser } from "../../db/schema";

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): SafeUser => {
  const request = ctx.switchToHttp().getRequest<{ user?: SafeUser }>();
  return request.user as SafeUser;
});
