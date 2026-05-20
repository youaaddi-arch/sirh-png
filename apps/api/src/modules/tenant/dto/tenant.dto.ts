import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MedicalProviderDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() doctor?: string;
}

class HealthInsuranceDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() contractNumber?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsNumber() shareEmployer?: number;
}

class ProvidentInsuranceDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() contractNumber?: string;
  @IsOptional() @IsString() phone?: string;
}

class PensionFundDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() code?: string;
}

class WorkInjuryFundDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsNumber() rate?: number;
}

class ApprenticeshipTaxDto {
  @IsOptional() @IsString() collector?: string;
  @IsOptional() @IsNumber() rate?: number;
}

export class CreateTenantDto {
  @IsString() code!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() siren?: string;
  @IsOptional() @IsString() siret?: string;
  @IsOptional() @IsString() apeCode?: string;
  @IsOptional() @IsString() urssafCode?: string;
  @IsOptional() @IsString() urssafName?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() repName?: string;
  @IsOptional() @IsString() repRole?: string;
  @IsOptional() @IsString() conventionCode?: string;
  @IsOptional() @ValidateNested() @Type(() => MedicalProviderDto) medicalProvider?: MedicalProviderDto;
  @IsOptional() @ValidateNested() @Type(() => HealthInsuranceDto) healthInsurance?: HealthInsuranceDto;
  @IsOptional() @ValidateNested() @Type(() => ProvidentInsuranceDto) providentInsurance?: ProvidentInsuranceDto;
  @IsOptional() @ValidateNested() @Type(() => PensionFundDto) pensionFund?: PensionFundDto;
  @IsOptional() @ValidateNested() @Type(() => WorkInjuryFundDto) workInjuryFund?: WorkInjuryFundDto;
  @IsOptional() @ValidateNested() @Type(() => ApprenticeshipTaxDto) apprenticeshipTax?: ApprenticeshipTaxDto;
  @IsOptional() @IsString() cseRepresentative?: string;
  @IsOptional() @IsString() safetyOfficer?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsString() organisationId!: string;
}

export class UpdateTenantDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() siren?: string;
  @IsOptional() @IsString() siret?: string;
  @IsOptional() @IsString() apeCode?: string;
  @IsOptional() @IsString() urssafCode?: string;
  @IsOptional() @IsString() urssafName?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() repName?: string;
  @IsOptional() @IsString() repRole?: string;
  @IsOptional() @IsString() conventionCode?: string;
  @IsOptional() @ValidateNested() @Type(() => MedicalProviderDto) medicalProvider?: MedicalProviderDto;
  @IsOptional() @ValidateNested() @Type(() => HealthInsuranceDto) healthInsurance?: HealthInsuranceDto;
  @IsOptional() @ValidateNested() @Type(() => ProvidentInsuranceDto) providentInsurance?: ProvidentInsuranceDto;
  @IsOptional() @ValidateNested() @Type(() => PensionFundDto) pensionFund?: PensionFundDto;
  @IsOptional() @ValidateNested() @Type(() => WorkInjuryFundDto) workInjuryFund?: WorkInjuryFundDto;
  @IsOptional() @ValidateNested() @Type(() => ApprenticeshipTaxDto) apprenticeshipTax?: ApprenticeshipTaxDto;
  @IsOptional() @IsString() cseRepresentative?: string;
  @IsOptional() @IsString() safetyOfficer?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}
