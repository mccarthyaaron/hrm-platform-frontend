import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/employees/register')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>register employee</div>;
}
