import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { LegifranceModule } from '../../integrations/legifrance/legifrance.module';

@Module({
  imports: [LegifranceModule],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
