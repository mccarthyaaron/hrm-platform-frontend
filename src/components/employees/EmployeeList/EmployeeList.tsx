import { useMemo, useState } from 'react';
import { Button, Dropdown, Input, Select, Space, Table, type MenuProps, type TableColumnsType } from 'antd';
import { Link } from '@tanstack/react-router';
import { DownOutlined } from '@ant-design/icons';

import styles from './EmployeeList.module.scss';

type EmployeeStatus = 'active' | 'inactive' | 'other';
type EmployeeCampus = 'Platinum' | 'Horizon' | 'Daisy';
type EmployeeSection = 'Nursery' | 'Primary';

type Employee = {
  id: string;
  surname: string;
  givenNames: string;
  campus: EmployeeCampus;
  section: EmployeeSection;
  phone: string;
  status: EmployeeStatus;
};

const employees: Employee[] = [
  {
    id: '1',
    surname: 'Okello',
    givenNames: 'Grace',
    campus: 'Platinum',
    section: 'Nursery',
    phone: '+256 700 123456',
    status: 'active',
  },
  {
    id: '2',
    surname: 'Mukasa',
    givenNames: 'John',
    campus: 'Horizon',
    section: 'Primary',
    phone: '+256 701 654321',
    status: 'active',
  },
  {
    id: '3',
    surname: 'Namutebi',
    givenNames: 'Sarah',
    campus: 'Daisy',
    section: 'Nursery',
    phone: '+256 702 987654',
    status: 'inactive',
  },
  {
    id: '4',
    surname: 'Waiswa',
    givenNames: 'Peter',
    campus: 'Horizon',
    section: 'Primary',
    phone: '+256 703 246810',
    status: 'active',
  },
  {
    id: '5',
    surname: 'Kato',
    givenNames: 'Joseph',
    campus: 'Platinum',
    section: 'Primary',
    phone: '+256 704 135791',
    status: 'inactive',
  },
  {
    id: '6',
    surname: 'Achan',
    givenNames: 'Ruth',
    campus: 'Daisy',
    section: 'Nursery',
    phone: '+256 705 192837',
    status: 'active',
  },
  {
    id: '7',
    surname: 'Nsubuga',
    givenNames: 'Brian',
    campus: 'Horizon',
    section: 'Primary',
    phone: '+256 706 314159',
    status: 'other',
  },
];

type TableRecord = Employee & { name: string };

const columns: TableColumnsType<TableRecord> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Campus',
    dataIndex: 'campus',
    key: 'campus',
  },
  {
    title: 'Section',
    dataIndex: 'section',
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
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus>('active');
  const [campusFilter, setCampusFilter] = useState<'All' | EmployeeCampus>('All');
  const [sectionFilter, setSectionFilter] = useState<'All' | EmployeeSection>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const statusLabels: Record<EmployeeStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    other: 'Other',
  };
  const statusOptions: EmployeeStatus[] = ['active', 'inactive', 'other'];

  const statusMenuItems: MenuProps['items'] = statusOptions
    .filter((status) => status !== statusFilter)
    .map((status) => ({
      key: status,
      label: statusLabels[status],
    }));
  const selectedStatusKeys: string[] = [];
  const statusButtonLabel = statusLabels[statusFilter];

  const dataSource = useMemo(() => {
    return employees
      .filter((employee) => {
        if (statusFilter === 'active') {
          return employee.status === 'active';
        }
        return employee.status === statusFilter;
      })
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
        name: `${employee.surname} ${employee.givenNames}`,
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
            <Button type={statusFilter === 'active' ? 'primary' : 'default'}>{statusButtonLabel}</Button>
            <Dropdown
              menu={{
                items: statusMenuItems,
                selectable: true,
                selectedKeys: selectedStatusKeys,
                onClick: ({ key }) => setStatusFilter(key as EmployeeStatus),
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
            <Select<'All' | EmployeeCampus>
              value={campusFilter}
              style={{ width: 160 }}
              onChange={(value) => setCampusFilter(value)}
              options={[
                { label: 'All', value: 'All' },
                { label: 'Platinum', value: 'Platinum' },
                { label: 'Horizon', value: 'Horizon' },
                { label: 'Daisy', value: 'Daisy' },
              ]}
            />
          </div>

          <div className={styles.filterControl}>
            <span className={styles.filterLabel}>Section</span>
            <Select<'All' | EmployeeSection>
              value={sectionFilter}
              style={{ width: 160 }}
              onChange={(value) => setSectionFilter(value)}
              options={[
                { label: 'All', value: 'All' },
                { label: 'Nursery', value: 'Nursery' },
                { label: 'Primary', value: 'Primary' },
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
              style={{ width: 240 }}
            />
          </div>
        </Space>
      </div>

      <Table<TableRecord>
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        className={styles.table}
      />
    </div>
  );
}
