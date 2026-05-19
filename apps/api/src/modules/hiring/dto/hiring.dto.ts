import { IsDateString, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateHireProcessDto {
  @IsString() tenantId!: string;
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsEmail() email!: string;
  @IsString() jobTitle!: string;
  @IsOptional() @IsString() contractType?: string;
  @IsOptional() @IsString() statusClass?: string;
  @IsNumber() @Min(0) grossSalary!: number;
  @IsDateString() startDate!: string;
  @IsOptional() @IsNumber() weeklyHours?: number;
  @IsOptional() @IsString() managerId?: string;
  @IsOptional() @IsString() assignedToId?: string;
}

const ALLOWED_STATUSES = ['pre_embauche', 'soumis', 'valide', 'contrat_genere', 'contrat_signe', 'embauche', 'annule'] as const;

export class AdvanceHireProcessDto {
  @IsEnum(ALLOWED_STATUSES) status!: (typeof ALLOWED_STATUSES)[number];
  @IsOptional() @IsString() reason?: string;
}
