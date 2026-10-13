import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { DbService } from "../../db/db.service";
import { users, type SafeUser, type UserRow } from "../../db/schema";
import { RegisterDto, LoginDto } from "./dto/auth.dto";
import { toSafeUser } from "../../common/guards/jwt-auth.guard";

export interface Session {
  token: string;
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DbService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<Session> {
    const email = dto.email.trim().toLowerCase();
    const [existing] = await this.db.db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      throw new ConflictException("Ya existe una cuenta registrada con ese email");
    }
    const password = await bcrypt.hash(dto.password, 10);
    const name = dto.name.trim();
    const [user] = await this.db.db
      .insert(users)
      .values({
        email,
        name,
        password,
        phone: dto.phone ?? null,
        location: "Capital Federal",
        memberSince: new Date().getFullYear(),
        sellerName: name,
      })
      .returning();
    return this.buildSession(user);
  }

  async login(dto: LoginDto): Promise<Session> {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email.trim().toLowerCase()))
      .limit(1);
    if (!user) {
      throw new UnauthorizedException("El email o la contraseña son incorrectos");
    }
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException("El email o la contraseña son incorrectos");
    }
    return this.buildSession(user);
  }

  async me(userId: string): Promise<SafeUser> {
    const [user] = await this.db.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new UnauthorizedException("Tu sesión expiró, volvé a ingresar");
    }
    return toSafeUser(user);
  }

  private buildSession(user: UserRow): Session {
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return { token, user: toSafeUser(user) };
  }
}
