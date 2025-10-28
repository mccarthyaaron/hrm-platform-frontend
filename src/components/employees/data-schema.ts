export const genderOptions = ['male', 'female'] as const;
export const maritalStatusOptions = ['single', 'married', 'cohabiting', 'widowed'] as const;
export const campusOptions = ['platinum', 'horizon', 'daisy'] as const;
export const employeeTypeOptions = ['teaching', 'non-teaching'] as const;
export const sectionOptions = ['nursery', 'primary'] as const;
export const employmentStatusOptions = ['active', 'left', 'other'] as const;

export const GENDER: Record<'MALE' | 'FEMALE', (typeof genderOptions)[number]> = {
  MALE: 'male',
  FEMALE: 'female',
} as const;

export const MARITAL_STATUS: Record<
  'SINGLE' | 'MARRIED' | 'COHABITING' | 'WIDOWED',
  (typeof maritalStatusOptions)[number]
> = {
  SINGLE: 'single',
  MARRIED: 'married',
  COHABITING: 'cohabiting',
  WIDOWED: 'widowed',
} as const;

export const CAMPUS: Record<'PLATINUM' | 'HORIZON' | 'DAISY', (typeof campusOptions)[number]> = {
  PLATINUM: 'platinum',
  HORIZON: 'horizon',
  DAISY: 'daisy',
} as const;

export const EMPLOYEE_TYPE: Record<'TEACHING' | 'NON_TEACHING', (typeof employeeTypeOptions)[number]> = {
  TEACHING: 'teaching',
  NON_TEACHING: 'non-teaching',
} as const;

export const SECTION: Record<'NURSERY' | 'PRIMARY', (typeof sectionOptions)[number]> = {
  NURSERY: 'nursery',
  PRIMARY: 'primary',
} as const;

export const EMPLOYMENT_STATUS: Record<'ACTIVE' | 'LEFT' | 'OTHER', (typeof employmentStatusOptions)[number]> = {
  ACTIVE: 'active',
  LEFT: 'left',
  OTHER: 'other',
} as const;

export type Gender = (typeof GENDER)[keyof typeof GENDER];
export type MaritalStatus = (typeof MARITAL_STATUS)[keyof typeof MARITAL_STATUS];
export type Campus = (typeof CAMPUS)[keyof typeof CAMPUS];
export type EmployeeType = (typeof EMPLOYEE_TYPE)[keyof typeof EMPLOYEE_TYPE];
export type Section = (typeof SECTION)[keyof typeof SECTION];
export type EmploymentStatus = (typeof EMPLOYMENT_STATUS)[keyof typeof EMPLOYMENT_STATUS];

export type Employee = {
  id: string;
  surname: string;
  given_name: string;
  date_of_birth: string;
  gender: Gender;
  nationality: string;
  nin?: string | null;
  telephone_number1: string;
  telephone_number2?: string | null;
  email_address?: string | null;
  place_of_residence: string;
  marital_status: MaritalStatus;
  tin?: string | null;
  nssf_number?: string | null;
  campus: Campus;
  employee_type: EmployeeType;
  section?: Section | null;
  job_title: string;
  employment_status: EmploymentStatus;
};
