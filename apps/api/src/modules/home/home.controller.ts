import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HomeService } from "./home.service";
import type { HomePayload } from "@trato/shared";

@ApiTags("home")
@Controller("home")
export class HomeController {
  constructor(private readonly home: HomeService) {}

  @Get()
  payload(): Promise<HomePayload> {
    return this.home.payload();
  }
}
