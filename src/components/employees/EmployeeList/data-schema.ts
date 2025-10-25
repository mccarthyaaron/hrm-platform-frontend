import { z } from 'zod';

export const GenderSchema = z.enum(['male', 'female']);
export const MaritalStatusSchema = z.enum(['single', 'married', 'cohabiting', 'widowed']);
export const CampusSchema = z.enum(['platinum', 'horizon', 'daisy']);
export const EmployeeTypeSchema = z.enum(['teaching', 'non-teaching']);
export const SectionSchema = z.enum(['nursery', 'primary']);
export const EmploymentStatusSchema = z.enum(['active', 'left', 'other']);

export type Gender = z.infer<typeof GenderSchema>;
export type MaritalStatus = z.infer<typeof MaritalStatusSchema>;
export type Campus = z.infer<typeof CampusSchema>;
export type EmployeeType = z.infer<typeof EmployeeTypeSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type EmploymentStatus = z.infer<typeof EmploymentStatusSchema>;
