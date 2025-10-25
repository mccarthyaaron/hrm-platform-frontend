import { createFileRoute } from '@tanstack/react-router';

import { EmployeeList } from '../../components/employees/EmployeeList/EmployeeList';

export const Route = createFileRoute('/employees/list')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EmployeeList />;
}
