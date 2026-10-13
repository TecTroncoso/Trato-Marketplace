import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { QuestionsService } from "./questions.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { SafeUser } from "../../common/guards/jwt-auth.guard";

class AskQuestionDto {
  productId: string;
  question: string;
}

class AnswerQuestionDto {
  answer: string;
}

@ApiTags("questions")
@Controller()
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  @Get("products/:id/questions")
  list(@Param("id") id: string) {
    return this.questions.listForProduct(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("questions")
  ask(@CurrentUser() user: SafeUser, @Body() dto: AskQuestionDto) {
    return this.questions.ask(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("questions/:id/answer")
  answer(@CurrentUser() user: SafeUser, @Param("id") id: string, @Body() dto: AnswerQuestionDto) {
    return this.questions.answer(user.id, id, dto.answer);
  }
}
