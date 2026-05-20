import { Module } from '@nestjs/common';
import { KnowledgeTestController } from './knowledge-test.controller';
import { KnowledgeTestService } from './knowledge-test.service';

@Module({ controllers: [KnowledgeTestController], providers: [KnowledgeTestService], exports: [KnowledgeTestService] })
export class KnowledgeTestModule {}
