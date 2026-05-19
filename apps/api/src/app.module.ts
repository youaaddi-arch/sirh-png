import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthController } from './modules/health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { HiringModule } from './modules/hiring/hiring.module';
import { PreboardingModule } from './modules/preboarding/preboarding.module';
import { ContractModule } from './modules/contract/contract.module';
import { LetterModule } from './modules/letter/letter.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { LeaveModule } from './modules/leave/leave.module';
import { TimesheetModule } from './modules/timesheet/timesheet.module';
import { OvertimeModule } from './modules/overtime/overtime.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { TeamModule } from './modules/team/team.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { ReviewModule } from './modules/review/review.module';
import { KnowledgeTestModule } from './modules/knowledge-test/knowledge-test.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { LegifranceModule } from './integrations/legifrance/legifrance.module';
import { StorageModule } from './integrations/storage/storage.module';
import { OcrModule } from './integrations/ocr/ocr.module';
import { ClaudeModule } from './integrations/claude/claude.module';
import { SignatureModule } from './integrations/signature/signature.module';
import { EmailModule } from './integrations/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000,
      limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
    }]),
    PrismaModule,
    StorageModule,
    OcrModule,
    ClaudeModule,
    SignatureModule,
    EmailModule,
    LegifranceModule,
    AuthModule,
    TenantModule,
    EmployeeModule,
    HiringModule,
    PreboardingModule,
    LetterModule,
    OnboardingModule,
    ContractModule,
    LeaveModule,
    TimesheetModule,
    OvertimeModule,
    ExpenseModule,
    TeamModule,
    PayrollModule,
    ReviewModule,
    KnowledgeTestModule,
    AlertsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
