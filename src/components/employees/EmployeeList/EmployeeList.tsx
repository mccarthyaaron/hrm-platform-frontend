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
  type EmploymentStatus,
  type Section,
} from './data-schema';
import styles from './EmployeeList.module.scss';

type Employee = {
  id: string;
  surname: string;
  givenNames: string;
  campus: Campus;
  section: Section;
  phone: string;
  status: EmploymentStatus;
};

const employees: Employee[] = [
  {
    id: '1',
    surname: 'okello',
    givenNames: 'grace',
    campus: 'platinum',
    section: 'nursery',
    phone: '+256 700 123456',
    status: 'active',
  },
  {
    id: '2',
    surname: 'Mukasa',
    givenNames: 'John',
    campus: 'horizon',
    section: 'primary',
    phone: '+256 701 654321',
    status: 'active',
  },
  {
    id: '3',
    surname: 'Namutebi',
    givenNames: 'Sarah',
    campus: 'daisy',
    section: 'nursery',
    phone: '+256 702 987654',
    status: 'left',
  },
  {
    id: '4',
    surname: 'Waiswa',
    givenNames: 'Peter',
    campus: 'horizon',
    section: 'primary',
    phone: '+256 703 246810',
    status: 'active',
  },
  {
    id: '5',
    surname: 'Kato',
    givenNames: 'Joseph',
    campus: 'platinum',
    section: 'primary',
    phone: '+256 704 135791',
    status: 'left',
  },
  {
    id: '6',
    surname: 'Achan',
    givenNames: 'Ruth',
    campus: 'daisy',
    section: 'nursery',
    phone: '+256 705 192837',
    status: 'active',
  },
  {
    id: '7',
    surname: 'Nsubuga',
    givenNames: 'Brian',
    campus: 'horizon',
    section: 'primary',
    phone: '+256 706 314159',
    status: 'other',
  },
];

type TableRecord = Employee & {
  name: string;
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
      .filter((employee) => employee.status === statusFilter)
      .filter((employee) => (campusFilter === 'All' ? true : employee.campus === campusFilter))
      .filter((employee) => (sectionFilter === 'All' ? true : employee.section === sectionFilter))
      .filter((employee) => {
        if (!searchTerm.trim()) {
          return true;
        }
        const name = `${employee.surname} ${employee.givenNames}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
      })
      .map((employee) => ({
        ...employee,
        name: `${capitalize(employee.surname)} ${capitalize(employee.givenNames)}`,
        campusLabel: capitalize(employee.campus),
        sectionLabel: capitalize(employee.section),
      }));
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
