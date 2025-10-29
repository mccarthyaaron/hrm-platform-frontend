import { useQuery } from '@tanstack/react-query';
import { type EmployeeQueryFilters } from './employee-list.component';
import { type Employee } from './data-schema';
import { keepPreviousData } from '@tanstack/react-query';
import { fetcher } from '../../utilities/fetcher';

export function useEmployees(filters: EmployeeQueryFilters) {
  const result = useQuery({
    queryKey: ['employees', filters.employment_status],
    queryFn: () =>
      fetcher<Employee[]>('/employees', {
        method: 'GET',
        query: { employment_status: filters.employment_status },
      }),
    // placeholderData: keepPreviousData,
  });
  const employees = result.data ?? [];

  let filteredEmployees = employees
    ?.filter((employee) => (filters.campus === 'All' ? true : employee.campus === filters.campus))
    .filter((employee) => (filters.employee_type === 'All' ? true : employee.employee_type === filters.employee_type));

  if (filters.section !== undefined) {
    filteredEmployees = filteredEmployees.filter((employee) =>
      filters.section === 'All' ? true : employee.section === filters.section
    );
  }

  return { ...result, data: filteredEmployees };
}
