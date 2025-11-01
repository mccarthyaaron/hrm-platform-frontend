import { createFileRoute } from '@tanstack/react-router';
import EmployeeDetails from '../../components/employees/employee-details.component';

export const Route = createFileRoute('/employees/$employeeId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { employeeId } = Route.useParams();
  return <EmployeeDetails employeeId={employeeId} />;
}
