import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Input, Row, Select, Typography, message } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { capitalize } from 'lodash-es';

import {
  campusOptions,
  employeeTypeOptions,
  employmentStatusOptions,
  genderOptions,
  maritalStatusOptions,
  sectionOptions,
} from './data-schema';
import { fetcher, HttpError } from '../../utilities/fetcher';
import styles from './employee-registration-form.module.scss';

const { Title } = Typography;

const toZodEnum = <T extends readonly string[]>(values: T) =>
  z.enum(values as unknown as [T[number], ...T[number][]]);

const primaryPhoneSchema = z
  .string({ required_error: 'Primary telephone number is required' })
  .trim()
  .regex(/^\d{10}$/, { message: 'Primary telephone number must be exactly 10 digits' });

const optionalPhoneSchema = z
  .union([
    z
      .string()
      .trim()
      .regex(/^\d{10}$/, { message: 'Secondary telephone number must be exactly 10 digits' }),
    z.literal(''),
    z.undefined(),
  ])
  .transform((value) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  });

const optionalEmailSchema = z
  .union([z.string().trim().email({ message: 'Invalid email address' }), z.literal(''), z.undefined()])
  .transform((value) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  });

const optionalStringSchema = (maxLength: number, fieldLabel: string) =>
  z
    .union([
      z
        .string()
        .trim()
        .max(maxLength, { message: `${fieldLabel} must be at most ${maxLength} characters` }),
      z.literal(''),
      z.undefined(),
    ])
    .transform((value) => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    });

const sectionSchema = z
  .union([toZodEnum(sectionOptions), z.literal(''), z.undefined()])
  .transform((value) => (typeof value === 'string' && value !== '' ? value : undefined));

const employeeRegistrationFormSchema = z
  .object({
    surname: z
      .string()
      .trim()
      .min(1, { message: 'Surname is required' })
      .max(100, { message: 'Surname must be at most 100 characters' }),
    given_name: z
      .string()
      .trim()
      .min(1, { message: 'Given name is required' })
      .max(100, { message: 'Given name must be at most 100 characters' }),
    date_of_birth: z
      .string({ required_error: 'Date of birth is required' })
      .trim()
      .min(1, { message: 'Date of birth is required' })
      .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Enter a valid date' }),
    gender: toZodEnum(genderOptions),
    nationality: z
      .string()
      .trim()
      .min(1, { message: 'Nationality is required' })
      .max(50, { message: 'Nationality must be at most 50 characters' }),
    nin: optionalStringSchema(20, 'NIN'),
    telephone_number1: primaryPhoneSchema,
    telephone_number2: optionalPhoneSchema,
    email_address: optionalEmailSchema,
    place_of_residence: z
      .string()
      .trim()
      .min(1, { message: 'Place of residence is required' })
      .max(100, { message: 'Place of residence must be at most 100 characters' }),
    marital_status: toZodEnum(maritalStatusOptions),
    tin: optionalStringSchema(50, 'TIN'),
    nssf_number: optionalStringSchema(50, 'NSSF number'),
    campus: toZodEnum(campusOptions),
    employee_type: toZodEnum(employeeTypeOptions),
    section: sectionSchema,
    job_title: z.string().trim().min(1, { message: 'Job title is required' }),
    employment_status: toZodEnum(employmentStatusOptions),
  })
  .superRefine((values, context) => {
    if (values.employee_type === 'teaching' && !values.section) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Section is required for teaching employees',
        path: ['section'],
      });
    }
  });

export type EmployeeRegistrationFormValues = z.infer<typeof employeeRegistrationFormSchema>;

const defaultEmployeeType = (
  employeeTypeOptions.includes('non-teaching') ? 'non-teaching' : employeeTypeOptions[0]
) as EmployeeRegistrationFormValues['employee_type'];

const defaultEmploymentStatus = (
  employmentStatusOptions.includes('active') ? 'active' : employmentStatusOptions[0]
) as EmployeeRegistrationFormValues['employment_status'];

const defaultGender = (
  genderOptions.includes('male') ? 'male' : genderOptions[0]
) as EmployeeRegistrationFormValues['gender'];

const defaultMaritalStatus = (
  maritalStatusOptions.includes('single') ? 'single' : maritalStatusOptions[0]
) as EmployeeRegistrationFormValues['marital_status'];

const defaultCampus = (
  campusOptions.includes('platinum') ? 'platinum' : campusOptions[0]
) as EmployeeRegistrationFormValues['campus'];

const defaultValues: EmployeeRegistrationFormValues = {
  surname: '',
  given_name: '',
  date_of_birth: '',
  gender: defaultGender,
  nationality: 'Uganda',
  nin: undefined,
  telephone_number1: '',
  telephone_number2: undefined,
  email_address: undefined,
  place_of_residence: '',
  marital_status: defaultMaritalStatus,
  tin: undefined,
  nssf_number: undefined,
  campus: defaultCampus,
  employee_type: defaultEmployeeType,
  section: undefined,
  job_title: '',
  employment_status: defaultEmploymentStatus,
};

export function EmployeeRegistrationForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [messageApi, messageContextHolder] = message.useMessage();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    setValue,
  } = useForm<EmployeeRegistrationFormValues>({
    resolver: zodResolver(employeeRegistrationFormSchema),
    defaultValues,
  });

  const employeeType = watch('employee_type');

  useEffect(() => {
    if (employeeType !== 'teaching') {
      setValue('section', undefined, { shouldValidate: true });
    }
  }, [employeeType, setValue]);

  const sectionSelectOptions = useMemo(
    () =>
      sectionOptions.map((section) => ({
        label: capitalize(section),
        value: section,
      })),
    []
  );

  const createEmployeeMutation = useMutation({
    mutationFn: async (payload: EmployeeRegistrationFormValues) => {
      const response = await fetcher<{ id: string }>('/employees', {
        method: 'POST',
        body: payload.employee_type === 'teaching' ? payload : { ...payload, section: undefined },
      });
      return response;
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createEmployeeMutation.mutateAsync(values);
      messageApi.success('Employee registered successfully');
      reset(defaultValues);
    } catch (error) {
      if (error instanceof HttpError) {
        const { field } = error.errorBody ?? {};
        if (field && field in values) {
          setError(field as keyof EmployeeRegistrationFormValues, { type: 'server', message: error.message });
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError('Unable to register employee. Please try again.');
      }
    }
  });

  return (
    <Form layout="vertical" component="form" onSubmitCapture={onSubmit} className={styles.form}>
      {messageContextHolder}
      {formError ? <Alert type="error" showIcon message={formError} className={styles.formAlert} /> : null}

      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          Bio Data
        </Title>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Surname"
              required
              validateStatus={errors.surname ? 'error' : undefined}
              help={errors.surname?.message}
            >
              <Controller
                name="surname"
                control={control}
                render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="Enter surname" />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Given Name"
              required
              validateStatus={errors.given_name ? 'error' : undefined}
              help={errors.given_name?.message}
            >
              <Controller
                name="given_name"
                control={control}
                render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="Enter given name" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Date of Birth"
              required
              validateStatus={errors.date_of_birth ? 'error' : undefined}
              help={errors.date_of_birth?.message}
            >
              <Controller
                name="date_of_birth"
                control={control}
                render={({ field }) => <Input {...field} value={field.value ?? ''} type="date" placeholder="YYYY-MM-DD" />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Gender"
              required
              validateStatus={errors.gender ? 'error' : undefined}
              help={errors.gender?.message}
            >
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={genderOptions.map((gender) => ({
                      label: capitalize(gender),
                      value: gender,
                    }))}
                    placeholder="Select gender"
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Marital Status"
              required
              validateStatus={errors.marital_status ? 'error' : undefined}
              help={errors.marital_status?.message}
            >
              <Controller
                name="marital_status"
                control={control}
                render={({ field }) => (
                  <Select
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={maritalStatusOptions.map((status) => ({
                      label: capitalize(status),
                      value: status,
                    }))}
                    placeholder="Select marital status"
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Nationality"
              required
              validateStatus={errors.nationality ? 'error' : undefined}
              help={errors.nationality?.message}
            >
              <Controller
                name="nationality"
                control={control}
                render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="Enter nationality" />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="National ID Number (NIN)"
              validateStatus={errors.nin ? 'error' : undefined}
              help={errors.nin?.message}
            >
              <Controller
                name="nin"
                control={control}
                render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="Enter NIN (optional)" />}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          Contact Information
        </Title>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Primary Telephone Number"
              required
              validateStatus={errors.telephone_number1 ? 'error' : undefined}
              help={errors.telephone_number1?.message}
            >
              <Controller
                name="telephone_number1"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ''} placeholder="e.g. 0700123456" maxLength={10} />
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Secondary Telephone Number"
              validateStatus={errors.telephone_number2 ? 'error' : undefined}
              help={errors.telephone_number2?.message}
            >
              <Controller
                name="telephone_number2"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ''} placeholder="Optional secondary number" maxLength={10} />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Email Address"
              validateStatus={errors.email_address ? 'error' : undefined}
              help={errors.email_address?.message}
            >
              <Controller
                name="email_address"
                control={control}
                render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="Enter email address" />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Place of Residence"
              required
              validateStatus={errors.place_of_residence ? 'error' : undefined}
              help={errors.place_of_residence?.message}
            >
              <Controller
                name="place_of_residence"
                control={control}
                render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="Enter place of residence" />}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          Work Information
        </Title>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="TIN"
              validateStatus={errors.tin ? 'error' : undefined}
              help={errors.tin?.message}
            >
              <Controller
                name="tin"
                control={control}
                render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="Enter TIN (optional)" />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="NSSF Number"
              validateStatus={errors.nssf_number ? 'error' : undefined}
              help={errors.nssf_number?.message}
            >
              <Controller
                name="nssf_number"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ''} placeholder="Enter NSSF number (optional)" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Campus"
              required
              validateStatus={errors.campus ? 'error' : undefined}
              help={errors.campus?.message}
            >
              <Controller
                name="campus"
                control={control}
                render={({ field }) => (
                  <Select
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={campusOptions.map((campus) => ({
                      label: capitalize(campus),
                      value: campus,
                    }))}
                    placeholder="Select campus"
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Employee Type"
              required
              validateStatus={errors.employee_type ? 'error' : undefined}
              help={errors.employee_type?.message}
            >
              <Controller
                name="employee_type"
                control={control}
                render={({ field }) => (
                  <Select
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={employeeTypeOptions.map((type) => ({
                      label: capitalize(type),
                      value: type,
                    }))}
                    placeholder="Select employee type"
                  />
                )}
              />
            </Form.Item>
          </Col>
          {employeeType === 'teaching' ? (
            <Col xs={24} md={8}>
              <Form.Item
                label="Section"
                required
                validateStatus={errors.section ? 'error' : undefined}
                help={errors.section?.message}
              >
                <Controller
                  name="section"
                  control={control}
                  render={({ field }) => (
                    <Select
                      ref={field.ref}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      options={sectionSelectOptions}
                      placeholder="Select section"
                    />
                  )}
                />
              </Form.Item>
            </Col>
          ) : null}
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Job Title"
              required
              validateStatus={errors.job_title ? 'error' : undefined}
              help={errors.job_title?.message}
            >
              <Controller
                name="job_title"
                control={control}
                render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="Enter job title" />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Employment Status"
              required
              validateStatus={errors.employment_status ? 'error' : undefined}
              help={errors.employment_status?.message}
            >
              <Controller
                name="employment_status"
                control={control}
                render={({ field }) => (
                  <Select
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={employmentStatusOptions.map((status) => ({
                      label: capitalize(status),
                      value: status,
                    }))}
                    placeholder="Select employment status"
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <Form.Item className={styles.submitItem}>
        <Button type="primary" htmlType="submit" loading={createEmployeeMutation.isPending}>
          Register Employee
        </Button>
      </Form.Item>
    </Form>
  );
}
