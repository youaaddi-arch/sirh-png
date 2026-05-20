import { Module } from '@nestjs/common';
import { LegifranceService } from './legifrance.service';
import { LegifranceController } from './legifrance.controller';

@Module({
  controllers: [LegifranceController],
  providers: [LegifranceService],
  exports: [LegifranceService],
})
export class LegifranceModule {}
