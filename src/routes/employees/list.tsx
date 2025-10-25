import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/employees/list')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Employees list</div>;
}
