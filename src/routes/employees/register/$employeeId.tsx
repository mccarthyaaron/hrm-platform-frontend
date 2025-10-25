import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/employees/register/$employeeId')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>edit employee details</div>;
}
