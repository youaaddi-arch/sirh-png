import { Module, forwardRef } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { LegifranceModule } from '../../integrations/legifrance/legifrance.module';
import { OnboardingModule } from '../onboarding/onboarding.module';

@Module({
  imports: [LegifranceModule, forwardRef(() => OnboardingModule)],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
