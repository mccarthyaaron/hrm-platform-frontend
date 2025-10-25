import { useMemo } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import styles from './side-bar.module.scss';

const { Sider } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: 'employees',
    label: 'Employees',
    children: [
      {
        key: 'employees-dashboard',
        label: <Link to="/employees">Dashboard</Link>,
      },
      {
        key: 'employees-list',
        label: <Link to="/employees/list">Employee List</Link>,
      },
    ],
  },
];

export function EmployeeSidebar() {
  const {
    location: { pathname },
  } = useRouterState();

  const selectedKeys = useMemo(() => {
    if (pathname === '/employees') {
      return ['employees-dashboard'];
    }

    if (pathname.startsWith('/employees/list')) {
      return ['employees-list'];
    }

    if (pathname.startsWith('/employees')) {
      return ['employees-dashboard'];
    }

    return [];
  }, [pathname]);

  return (
    <Sider className={styles.sidebar} width={240}>
      <Menu
        className={styles.menu}
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={['employees']}
        items={menuItems}
      />
    </Sider>
  );
}
