import { createFileRoute } from '@tanstack/react-router';

import { EmployeeList } from '../../components/employees/employee-list.component';

export const Route = createFileRoute('/employees/list')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EmployeeList />;
}
