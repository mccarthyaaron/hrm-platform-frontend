import { Button, Col, DatePicker, Form, Input, Row, Select, Typography } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { capitalize } from 'lodash-es';
import {
  campusOptions,
  employeeTypeOptions,
  employmentStatusOptions,
  genderOptions,
  maritalStatusOptions,
  sectionOptions,
  type Employee,
} from './data-schema';
import { HttpError } from '../../utilities/fetcher';
import styles from './employee-registration-form.module.scss';
import dayjs from 'dayjs';
import { postEmployee, putEmployee } from './heplers';
import { useFeedback } from '../../context/feedback.context';

const { Title } = Typography;

type EmployeeRegistrationFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Employee;
  closeForm?: () => void;
};

const employeeRegistrationFormSchema = z
  .object({
    surname: z.string().trim().min(1, { message: 'The Surname is required' }),
    given_name: z.string().trim().min(1, { message: 'The Given Name is required' }),
    date_of_birth: z.iso.date({ message: 'Invalid date of birth' }),
    gender: z.enum(genderOptions),
    nationality: z.string().trim().min(1, { message: 'A nationality is required' }),
    nin: z.string().trim(),
    telephone_number1: z.string().trim().length(10, { message: 'Primary telephone number must be 10 digits' }),
    telephone_number2: z
      .string()
      .trim()
      .refine((value) => value === '' || value.length === 10, {
        message: 'Secondary telephone number is optional but if provided must be 10 digits',
      }),
    email_address: z
      .string()
      .trim()
      .refine((value) => value === '' || z.email().safeParse(value).success, {
        message: 'Invalid email address',
      }),
    place_of_residence: z.string().trim().min(1, { message: 'Place of residence is required' }),
    marital_status: z.enum(maritalStatusOptions),
    tin: z.string().trim(),
    nssf_number: z.string().trim(),
    campus: z.enum(campusOptions),
    employee_type: z.enum(employeeTypeOptions),
    section: z.enum(sectionOptions).nullable(),
    job_title: z.string().trim().min(1, { message: 'Job title is required' }),
    employment_status: z.enum(employmentStatusOptions),
  })
  .superRefine((data, ctx) => {
    if (data.employee_type === 'teaching' && !data.section) {
      ctx.addIssue({
        code: 'custom',
        path: ['section'],
        message: 'Section is required for teaching employees',
      });
    }
  });

export type EmployeeRegistrationFormValues = z.infer<typeof employeeRegistrationFormSchema>;

export const EmployeeRegistrationForm = ({ mode, initialValues, closeForm }: EmployeeRegistrationFormProps) => {
  const client = useQueryClient();
  const { messageApi, notificationApi } = useFeedback();

  const initialDefaultValues = {
    surname: initialValues?.surname ?? '',
    given_name: initialValues?.given_name ?? '',
    date_of_birth: initialValues?.date_of_birth ?? '',
    gender: initialValues?.gender ?? 'male',
    nationality: initialValues?.nationality ?? 'Uganda',
    nin: initialValues?.nin ?? '',
    telephone_number1: initialValues?.telephone_number1 ?? '',
    telephone_number2: initialValues?.telephone_number2 ?? '',
    email_address: initialValues?.email_address ?? '',
    place_of_residence: initialValues?.place_of_residence ?? '',
    marital_status: initialValues?.marital_status ?? 'single',
    tin: initialValues?.tin ?? '',
    nssf_number: initialValues?.nssf_number ?? '',
    campus: initialValues?.campus ?? 'platinum',
    employee_type: initialValues?.employee_type ?? 'teaching',
    section: initialValues?.section ?? null,
    job_title: initialValues?.job_title ?? '',
    employment_status: initialValues?.employment_status ?? 'active',
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EmployeeRegistrationFormValues>({
    mode: 'all',
    resolver: zodResolver(employeeRegistrationFormSchema),
    defaultValues: initialDefaultValues,
  });

  const formEmployeeType = watch('employee_type');

  const createEmployeeMutation = useMutation({
    mutationFn: async (values: any) => {
      if (mode === 'create') {
        await postEmployee(values);
      } else {
        await putEmployee(initialValues?.id as string, values);
      }
    },
    onSuccess: async () => {
      if (mode === 'create') {
        reset(initialDefaultValues);
        messageApi.success('Employee registered successfully');
      } else {
        closeForm?.();
        messageApi.success('Employee information updated successfully');
      }
      await client.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: HttpError) => {
      notificationApi.error({
        message: mode === 'create' ? 'Employee registration failed' : 'Updating employee information failed',
        description: error.message,
        duration: 0,
      });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await createEmployeeMutation.mutate(values);
  });

  return (
    <Form layout="vertical" component="form" onSubmitCapture={onSubmit} className={styles.form}>
      <Title level={2} className={styles.formHeading}>
        {mode === 'create' && 'Register New Employee'}
      </Title>

      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          Bio Data
        </Title>

        <div className={styles.sectionBody}>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item
                label="Surname"
                required
                validateStatus={errors.surname ? 'error' : undefined}
                help={errors.surname?.message}
              >
                <Controller
                  name="surname"
                  control={control}
                  render={({ field }) => <Input {...field} value={field.value} placeholder="Enter the Surname" />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Given Names"
                required
                validateStatus={errors.given_name ? 'error' : undefined}
                help={errors.given_name?.message}
              >
                <Controller
                  name="given_name"
                  control={control}
                  render={({ field }) => <Input {...field} value={field.value} placeholder="Enter the Given Name" />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label="Date of Birth"
                required
                validateStatus={errors.date_of_birth ? 'error' : undefined}
                help={errors.date_of_birth?.message}
              >
                <Controller
                  name="date_of_birth"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date?.format('YYYY-MM-DD') ?? '')}
                      placeholder="DD/MM/YYYY"
                      format="DD/MM/YYYY"
                      style={{ width: '100%' }}
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={4}>
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
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="National ID Number (NIN)"
                validateStatus={errors.nin ? 'error' : undefined}
                help={errors.nin?.message}
              >
                <Controller
                  name="nin"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value} placeholder="Enter the NIN (optional)" />
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
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
            <Col xs={24} md={4}>
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
        </div>
      </div>

      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          Contact Information
        </Title>

        <div className={styles.sectionBody}>
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
                    <Input
                      {...field}
                      type="tel"
                      value={field.value ?? ''}
                      placeholder="e.g. 0700123456"
                      maxLength={10}
                    />
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
                    <Input
                      {...field}
                      type="tel"
                      value={field.value ?? ''}
                      placeholder="Optional secondary number"
                      maxLength={10}
                    />
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
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ''} placeholder="Enter email address" />
                  )}
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
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ''} placeholder="Enter place of residence" />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </div>

      <div className={styles.section}>
        <Title level={4} className={styles.sectionTitle}>
          Work Information
        </Title>

        <div className={styles.sectionBody}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="TIN" validateStatus={errors.tin ? 'error' : undefined} help={errors.tin?.message}>
                <Controller
                  name="tin"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ''} placeholder="Enter TIN (optional)" />
                  )}
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
                      onChange={(value) => {
                        field.onChange(value);
                        if (value === 'non-teaching') setValue('section', null, { shouldValidate: true });
                      }}
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
            {formEmployeeType === 'teaching' && (
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
                        options={sectionOptions.map((section) => ({
                          label: capitalize(section),
                          value: section,
                        }))}
                        placeholder="Select section"
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            )}
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
      </div>

      <Form.Item className={styles.submitItem}>
        <Button
          type="primary"
          htmlType="submit"
          loading={createEmployeeMutation.isPending}
          disabled={createEmployeeMutation.isPending}
        >
          {mode === 'create' ? 'Register Employee' : 'Update Employee'}
        </Button>
        {mode === 'edit' && (
          <Button
            danger
            htmlType="button"
            onClick={() => closeForm?.()}
            disabled={createEmployeeMutation.isPending}
            style={{ marginLeft: 8 }}
          >
            Cancel
          </Button>
        )}
      </Form.Item>
    </Form>
  );
};
