import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Layout, Typography } from 'antd';
import { Link } from '@tanstack/react-router';
import { EmployeeSidebar } from '../components/layout/side-bar.component';
import styles from './__root.module.scss';

const { Content, Header } = Layout;

function RootComponent() {
  return (
    <>
      <Layout className={styles.layout}>
        <Header className={styles.header}>
          <Typography.Title className={styles.headerTitle} level={3}>
            <Link to="/">Rainbow Christian School</Link>
          </Typography.Title>
        </Header>
        <Layout>
          <EmployeeSidebar />
          <Content className={styles.content}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
