import { useMemo, useState } from 'react';
import { Alert, Button, Dropdown, Input, Select, Space, Table, type MenuProps, type TableColumnsType } from 'antd';
import { Link } from '@tanstack/react-router';
import { DownOutlined } from '@ant-design/icons';
import { capitalize } from 'lodash-es';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  CAMPUS,
  EMPLOYMENT_STATUS,
  SECTION,
  employmentStatusOptions,
  type Campus,
  type Employee,
  type EmploymentStatus,
  type Section,
} from './data-schema';
import styles from './EmployeeList.module.scss';

type EmployeeQueryFilters = {
  employment_status: EmploymentStatus;
  campus: 'All' | Campus;
  section: 'All' | Section;
};

type TableRecord = Employee & {
  name: string;
  phone: string;
  campusLabel: string;
  sectionLabel: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  const queryFilters = useMemo<EmployeeQueryFilters>(
    () => ({
      employment_status: statusFilter,
      campus: campusFilter,
      section: sectionFilter,
    }),
    [statusFilter, campusFilter, sectionFilter]
  );

  const { data: employees = [], isLoading, isFetching, isError, error } = useEmployeesQuery(queryFilters);

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

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const dataSource = useMemo(() => {
    return employees
      .filter((employee) => {
        if (!normalizedSearch) {
          return true;
        }
        const fullName = `${employee.surname} ${employee.given_name}`.toLowerCase();
        return fullName.includes(normalizedSearch);
      })
      .map((employee) => {
        const phone = employee.telephone_number1 || employee.telephone_number2 || 'N/A';
        return {
          ...employee,
          name: `${capitalize(employee.surname)} ${capitalize(employee.given_name)}`,
          phone,
          campusLabel: capitalize(employee.campus),
          sectionLabel: employee.section ? capitalize(employee.section) : 'N/A',
        };
      });
  }, [employees, normalizedSearch]);

  const errorMessage = error instanceof Error ? error.message : 'Something went wrong while fetching employees.';

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

      {isError ? <Alert showIcon type="error" message={errorMessage} className={styles.errorAlert} /> : null}

      <Table<TableRecord>
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        size="small"
        title={() => (
          <div className={styles.tableHeader}>
            <span className={styles.tableTitle}>Results</span>
            <Button size="small" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        )}
        loading={isLoading || isFetching}
        className={styles.table}
      />
    </div>
  );
}

function useEmployeesQuery(filters: EmployeeQueryFilters) {
  const result = useQuery<Employee[], Error>({
    queryKey: ['employees', filters.employment_status],
    queryFn: () => fetchEmployees(filters.employment_status),
    placeholderData: keepPreviousData,
  });

  const filteredEmployees = result.data
    ?.filter((employee) => (filters.campus === 'All' ? true : employee.campus === filters.campus))
    .filter((employee) => (filters.section === 'All' ? true : employee.section === filters.section));

  return { ...result, data: filteredEmployees };
}

async function fetchEmployees(employmentStatus: EmployeeQueryFilters['employment_status']): Promise<Employee[]> {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }

  const url = new URL('/employees', API_BASE_URL);
  const params = new URLSearchParams();

  params.set('employment_status', employmentStatus);

  url.search = params.toString();

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch employees from the server.');
  }

  return (await response.json()) as Employee[];
}
