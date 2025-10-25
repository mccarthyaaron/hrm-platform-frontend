import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/employees/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Employees dashboard</div>;
}
