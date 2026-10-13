import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: "El nombre debe tener al menos 3 caracteres" })
  @MaxLength(80)
  name: string;

  @IsEmail({}, { message: "Ingresá un email válido" })
  email: string;

  @IsString()
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  @MaxLength(64)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}

export class LoginDto {
  @IsEmail({}, { message: "Ingresá un email válido" })
  email: string;

  @IsString()
  password: string;
}
