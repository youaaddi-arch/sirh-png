import { IsOptional, IsString } from 'class-validator';

export class CreateLetterDto {
  @IsString() tenantId!: string;
  @IsString() employeeId!: string;
  @IsString() type!: string;
  @IsOptional() @IsString() subject?: string;
  @IsOptional() @IsString() contentMd?: string;
  @IsOptional() data?: Record<string, any>;
}
