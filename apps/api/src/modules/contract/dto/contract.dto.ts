import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class GenerateFromHireDto {
  @IsString() hireProcessId!: string;
}

const SIGNER_ROLES = ['employee', 'employer'] as const;

export class SignContractDto {
  @IsEnum(SIGNER_ROLES) role!: (typeof SIGNER_ROLES)[number];
  @IsString() signerName!: string;
  @IsEmail() signerEmail!: string;
}
