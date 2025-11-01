import { useState } from 'react';
import { Alert, Button, Descriptions, Empty, Spin, Tabs, Tag } from 'antd';
import dayjs from 'dayjs';
import { capitalize } from 'lodash-es';

import { useEmployee } from './heplers';
import EmployeeEditForm from './employee-edit-form.component';

import styles from './employee-details.module.scss';

type EmployeeDetailsProps = {
  employeeId: string;
};

const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employeeId }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: employee, isLoading, isError, error } = useEmployee(employeeId);

  if (isLoading) {
    return (
      <div className={styles.centered}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className={styles.centered}>
        <Alert
          message="Unable to load employee details"
          description={error?.message ?? 'An unexpected error occurred.'}
          type="error"
          showIcon
        />
      </div>
    );
  }

  const fullName = `${employee.surname} ${employee.given_name}`.toUpperCase();
  const dateOfBirth = employee.date_of_birth ? dayjs(employee.date_of_birth) : null;
  const age = dateOfBirth ? dayjs().diff(dateOfBirth, 'year') : null;
  const formatValue = (value?: string | null) => {
    if (!value) return '—';
    return capitalize(value);
  };
  const statusColorMap: Record<string, 'success' | 'error' | 'default'> = {
    active: 'success',
    left: 'error',
    other: 'default',
  };
  const statusColor = statusColorMap[employee.employment_status] ?? 'default';
  const metaValues = [formatValue(employee.gender), age !== null ? `${age} yrs` : null].filter(Boolean).join(' • ');

  const personalInfo = (
    <div className={styles.sectionStack}>
      <Descriptions
        title="Bio Data"
        column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
        size="middle"
        className={styles.descriptions}
      >
        <Descriptions.Item label="Full Name">{fullName}</Descriptions.Item>
        <Descriptions.Item label="Gender">{formatValue(employee.gender)}</Descriptions.Item>
        <Descriptions.Item label="Date of Birth">
          {dateOfBirth ? dateOfBirth.format('DD MMMM YYYY') : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Age">{age !== null ? `${age} years` : '—'}</Descriptions.Item>
        <Descriptions.Item label="Nationality">{employee.nationality}</Descriptions.Item>
        <Descriptions.Item label="NIN">{employee.nin ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Marital Status">{formatValue(employee.marital_status)}</Descriptions.Item>
      </Descriptions>

      <Descriptions
        title="Contact Information"
        column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
        size="middle"
        className={styles.descriptions}
      >
        <Descriptions.Item label="Primary Telephone">{employee.telephone_number1}</Descriptions.Item>
        <Descriptions.Item label="Secondary Telephone">{employee.telephone_number2 ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Email Address">{employee.email_address ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Place of Residence">{employee.place_of_residence}</Descriptions.Item>
      </Descriptions>
    </div>
  );

  const workInfo = (
    <Descriptions
      column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
      size="middle"
      className={styles.descriptions}
      title="Work Information"
    >
      <Descriptions.Item label="TIN">{employee.tin ?? '—'}</Descriptions.Item>
      <Descriptions.Item label="NSSF Number">{employee.nssf_number ?? '—'}</Descriptions.Item>
      <Descriptions.Item label="Campus">{formatValue(employee.campus)}</Descriptions.Item>
      <Descriptions.Item label="Employee Type">{formatValue(employee.employee_type)}</Descriptions.Item>
      <Descriptions.Item label="Section">{formatValue(employee.section)}</Descriptions.Item>
      <Descriptions.Item label="Job Title">{employee.job_title}</Descriptions.Item>
      <Descriptions.Item label="Employment Status">{formatValue(employee.employment_status)}</Descriptions.Item>
    </Descriptions>
  );

  const tabItems = [
    {
      key: 'personal',
      label: 'Personal Information',
      children: personalInfo,
    },
    {
      key: 'work',
      label: 'Work Information',
      children: workInfo,
    },
    {
      key: 'relationships',
      label: 'Relationships',
      children: <Empty description="No relationships to display yet" />,
    },
    {
      key: 'attachments',
      label: 'Attachments',
      children: <Empty description="No attachments available yet" />,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.summary}>
        <div className={styles.photoPlaceholder} aria-hidden />
        <div className={styles.summaryContent}>
          <div className={styles.nameRow}>
            <div className={styles.nameBlock}>
              <h1 className={styles.employeeName}>{fullName}</h1>
              <div className={styles.metaRow}>
                {metaValues && <span className={styles.nameMeta}>{metaValues}</span>}
                <Tag className={styles.statusTag} color={statusColor}>
                  {formatValue(employee.employment_status)}
                </Tag>
              </div>
            </div>
          </div>
          <Descriptions column={{ xs: 1, sm: 1, md: 1, lg: 2 }} bordered={false} className={styles.summaryDescriptions}>
            <Descriptions.Item label="Job Title">{employee.job_title}</Descriptions.Item>
            <Descriptions.Item label="Telephone">{employee.telephone_number1}</Descriptions.Item>
            <Descriptions.Item label="Campus">{formatValue(employee.campus)}</Descriptions.Item>
          </Descriptions>
        </div>
        <div className={styles.summaryActions}>
          <Button type="primary" onClick={() => setIsEditOpen(true)}>
            Edit Details
          </Button>
        </div>
      </div>

      <Tabs className={styles.tabs} defaultActiveKey="personal" items={tabItems} />

      <EmployeeEditForm isOpen={isEditOpen} setIsOpen={setIsEditOpen} employeeId={employeeId} />
    </div>
  );
};

export default EmployeeDetails;
