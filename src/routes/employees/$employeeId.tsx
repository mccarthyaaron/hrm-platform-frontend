import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/employees/$employeeId')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>/Employee id</div>;
}
