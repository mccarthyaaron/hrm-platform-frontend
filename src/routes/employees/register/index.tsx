import { createFileRoute } from '@tanstack/react-router';

import { EmployeeRegistrationForm } from '../../../components/employees/employee-registration-form.component';

export const Route = createFileRoute('/employees/register/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EmployeeRegistrationForm />;
}
