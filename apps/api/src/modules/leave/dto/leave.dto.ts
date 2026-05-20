import { IsDateString, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateLeaveDto {
  @IsString() employeeId!: string;
  @IsString() typeId!: string;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
  @IsOptional() @IsBoolean() halfDayStart?: boolean;
  @IsOptional() @IsBoolean() halfDayEnd?: boolean;
  @IsOptional() @IsString() reason?: string;
}

export class RejectLeaveDto {
  @IsOptional() @IsString() reason?: string;
}
