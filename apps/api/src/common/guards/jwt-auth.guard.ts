import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import { DbService } from "../../db/db.service";
import { users, type SafeUser, type UserRow } from "../../db/schema";

export type { SafeUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly db: DbService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined>; user?: SafeUser }>();
    const header = request.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedException("Debes iniciar sesión para continuar");
    }
    let sub: string | undefined;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(header.slice(7));
      sub = payload.sub;
    } catch {
      throw new UnauthorizedException("Tu sesión expiró, volvé a ingresar");
    }
    const [user] = await this.db.db.select().from(users).where(eq(users.id, sub)).limit(1);
    if (!user) {
      throw new UnauthorizedException("Tu sesión expiró, volvé a ingresar");
    }
    request.user = toSafeUser(user);
    return true;
  }
}

export function toSafeUser(user: UserRow): SafeUser {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
