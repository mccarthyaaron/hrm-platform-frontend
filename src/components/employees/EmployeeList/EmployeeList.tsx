import { useMemo, useState } from 'react';
import { Button, Dropdown, Input, Select, Space, Table, type MenuProps, type TableColumnsType } from 'antd';
import { Link } from '@tanstack/react-router';
import { DownOutlined } from '@ant-design/icons';
import { capitalize } from 'lodash-es';
import {
  CAMPUS,
  EMPLOYMENT_STATUS,
  employmentStatusOptions,
  SECTION,
  type Campus,
  type Employee,
  type EmploymentStatus,
  type Section,
} from './data-schema';
import styles from './EmployeeList.module.scss';

const employees: Employee[] = [
  {
    id: '1',
    surname: 'Okello',
    given_name: 'Grace',
    date_of_birth: '1990-03-12',
    gender: 'female',
    nationality: 'Ugandan',
    nin: null,
    telephone_number1: '+256700123456',
    telephone_number2: null,
    email_address: 'grace.okello@example.com',
    place_of_residence: 'Kampala',
    marital_status: 'single',
    tin: null,
    nssf_number: null,
    campus: 'platinum',
    employee_type: 'teaching',
    section: 'nursery',
    job_title: 'Nursery Teacher',
    employment_status: 'active',
  },
  {
    id: '2',
    surname: 'Mukasa',
    given_name: 'John',
    date_of_birth: '1987-07-04',
    gender: 'male',
    nationality: 'Ugandan',
    nin: 'CM1234567Z9',
    telephone_number1: '+256701654321',
    telephone_number2: null,
    email_address: 'john.mukasa@example.com',
    place_of_residence: 'Mukono',
    marital_status: 'married',
    tin: 'TIN123456',
    nssf_number: 'NSSF998877',
    campus: 'horizon',
    employee_type: 'teaching',
    section: 'primary',
    job_title: 'Science Teacher',
    employment_status: 'active',
  },
  {
    id: '3',
    surname: 'Namutebi',
    given_name: 'Sarah',
    date_of_birth: '1992-01-20',
    gender: 'female',
    nationality: 'Ugandan',
    nin: null,
    telephone_number1: '+256702987654',
    telephone_number2: '+256780987654',
    email_address: 'sarah.namutebi@example.com',
    place_of_residence: 'Entebbe',
    marital_status: 'cohabiting',
    tin: null,
    nssf_number: null,
    campus: 'daisy',
    employee_type: 'teaching',
    section: 'nursery',
    job_title: 'Assistant Teacher',
    employment_status: 'left',
  },
  {
    id: '4',
    surname: 'Waiswa',
    given_name: 'Peter',
    date_of_birth: '1985-11-11',
    gender: 'male',
    nationality: 'Ugandan',
    nin: 'CF7654321X0',
    telephone_number1: '+256703246810',
    telephone_number2: null,
    email_address: 'peter.waiswa@example.com',
    place_of_residence: 'Jinja',
    marital_status: 'married',
    tin: 'TIN654321',
    nssf_number: 'NSSF776655',
    campus: 'horizon',
    employee_type: 'non-teaching',
    section: 'primary',
    job_title: 'ICT Support Specialist',
    employment_status: 'active',
  },
  {
    id: '5',
    surname: 'Kato',
    given_name: 'Joseph',
    date_of_birth: '1993-09-18',
    gender: 'male',
    nationality: 'Ugandan',
    nin: null,
    telephone_number1: '+256704135791',
    telephone_number2: null,
    email_address: 'joseph.kato@example.com',
    place_of_residence: 'Kawempe',
    marital_status: 'single',
    tin: null,
    nssf_number: null,
    campus: 'platinum',
    employee_type: 'teaching',
    section: 'primary',
    job_title: 'Mathematics Teacher',
    employment_status: 'left',
  },
  {
    id: '6',
    surname: 'Achan',
    given_name: 'Ruth',
    date_of_birth: '1995-05-30',
    gender: 'female',
    nationality: 'Ugandan',
    nin: 'CF0987654Y3',
    telephone_number1: '+256705192837',
    telephone_number2: '+256781234567',
    email_address: 'ruth.achan@example.com',
    place_of_residence: 'Gulu',
    marital_status: 'widowed',
    tin: null,
    nssf_number: 'NSSF223344',
    campus: 'daisy',
    employee_type: 'teaching',
    section: 'nursery',
    job_title: 'Head Teacher',
    employment_status: 'active',
  },
  {
    id: '7',
    surname: 'Nsubuga',
    given_name: 'Brian',
    date_of_birth: '1988-12-02',
    gender: 'male',
    nationality: 'Ugandan',
    nin: null,
    telephone_number1: '+256706314159',
    telephone_number2: null,
    email_address: 'brian.nsubuga@example.com',
    place_of_residence: 'Masaka',
    marital_status: 'cohabiting',
    tin: 'TIN334455',
    nssf_number: 'NSSF445566',
    campus: 'horizon',
    employee_type: 'non-teaching',
    section: 'primary',
    job_title: 'Sports Coordinator',
    employment_status: 'other',
  },
];

type TableRecord = Employee & {
  name: string;
  phone: string;
  campusLabel: string;
  sectionLabel: string;
};

const columns: TableColumnsType<TableRecord> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Campus',
    dataIndex: 'campusLabel',
    key: 'campus',
  },
  {
    title: 'Section',
    dataIndex: 'sectionLabel',
    key: 'section',
  },
  {
    title: 'Telephone',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Edit',
    key: 'edit',
    render: (_, record) => (
      <Link to="/employees/register/$employeeId" params={{ employeeId: record.id }}>
        Edit
      </Link>
    ),
  },
  {
    title: 'More Details',
    key: 'details',
    render: (_, record) => (
      <Link to="/employees/$employeeId" params={{ employeeId: record.id }}>
        More details
      </Link>
    ),
  },
];

export function EmployeeList() {
  const [statusFilter, setStatusFilter] = useState<EmploymentStatus>(EMPLOYMENT_STATUS.ACTIVE);
  const [campusFilter, setCampusFilter] = useState<'All' | Campus>('All');
  const [sectionFilter, setSectionFilter] = useState<'All' | Section>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const handleResetFilters = () => {
    setStatusFilter(EMPLOYMENT_STATUS.ACTIVE);
    setCampusFilter('All');
    setSectionFilter('All');
    setSearchTerm('');
  };

  const statusLabels: Record<EmploymentStatus, string> = {
    active: 'Active',
    left: 'Has Left',
    other: 'Other',
  };
  const statusButtonLabel = statusLabels[statusFilter];

  const statusMenuItems: MenuProps['items'] = employmentStatusOptions
    .filter((status) => status !== statusFilter)
    .map((status) => ({
      key: status,
      label: statusLabels[status],
    }));

  const dataSource = useMemo(() => {
    return employees
      .filter((employee) => employee.employment_status === statusFilter)
      .filter((employee) => (campusFilter === 'All' ? true : employee.campus === campusFilter))
      .filter((employee) => (sectionFilter === 'All' ? true : employee.section === sectionFilter))
      .filter((employee) => {
        if (!searchTerm.trim()) {
          return true;
        }
        const name = `${employee.surname} ${employee.given_name}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
      })
      .map((employee) => {
        const phone = employee.telephone_number1 ?? '';
        return {
          ...employee,
          name: `${capitalize(employee.surname)} ${capitalize(employee.given_name)}`,
          phone: phone || employee.telephone_number2 || 'N/A',
          campusLabel: capitalize(employee.campus),
          sectionLabel: employee.section ? capitalize(employee.section) : 'N/A',
        };
      });
  }, [statusFilter, campusFilter, sectionFilter, searchTerm]);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>Employee List</h1>
        <Button type="primary" className={styles.newEmployeeButton}>
          <Link to="/employees/register">New Employee</Link>
        </Button>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Employment Status:</span>
          <Space>
            <Button type="primary">{statusButtonLabel}</Button>
            <Dropdown
              menu={{
                items: statusMenuItems,
                selectable: true,
                onClick: ({ key }) => setStatusFilter(key as EmploymentStatus),
              }}
              trigger={['click']}
            >
              <Button
                aria-label="Toggle employee status filter"
                icon={<DownOutlined />}
                size="small"
                className={styles.statusDropdownButton}
                onClick={(event) => event.preventDefault()}
              />
            </Dropdown>
          </Space>
        </div>

        <Space size="large" wrap>
          <div className={styles.filterControl}>
            <span className={styles.filterLabel}>Campus</span>
            <Select<'All' | Campus>
              value={campusFilter}
              style={{ width: 160 }}
              onChange={(value) => setCampusFilter(value)}
              options={[
                { label: 'All', value: 'All' },
                { label: 'Platinum', value: CAMPUS.PLATINUM },
                { label: 'Horizon', value: CAMPUS.HORIZON },
                { label: 'Daisy', value: CAMPUS.DAISY },
              ]}
            />
          </div>

          <div className={styles.filterControl}>
            <span className={styles.filterLabel}>Section</span>
            <Select<'All' | Section>
              value={sectionFilter}
              style={{ width: 160 }}
              onChange={(value) => setSectionFilter(value)}
              options={[
                { label: 'All', value: 'All' },
                { label: 'Nursery', value: SECTION.NURSERY },
                { label: 'Primary', value: SECTION.PRIMARY },
              ]}
            />
          </div>

          <div className={styles.filterControl}>
            <span className={styles.filterLabel}>Search</span>
            <Input.Search
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onSearch={(value) => setSearchTerm(value)}
              placeholder="Search by name"
              allowClear
              style={{ width: 360 }}
            />
          </div>
        </Space>
      </div>

      <Table<TableRecord>
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        title={() => (
          <div className={styles.tableHeader}>
            <span className={styles.tableTitle}>Results</span>
            <Button size="small" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        )}
        className={styles.table}
      />
    </div>
  );
}
