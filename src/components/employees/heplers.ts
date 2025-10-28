import { useQuery } from '@tanstack/react-query';
import { type EmployeeQueryFilters } from './employee-list.component';
import { type Employee } from './data-schema';
import { keepPreviousData } from '@tanstack/react-query';
import { fetcher } from '../../utilities/fetcher';

export function useEmployees(filters: EmployeeQueryFilters) {
  // throw new Error('test errror');

  const result = useQuery({
    queryKey: ['employees', filters.employment_status],
    queryFn: () =>
      fetcher<Employee[]>('/employees', {
        method: 'GET',
        query: { employment_status: filters.employment_status },
      }),
    // placeholderData: keepPreviousData,
  });

  const filteredEmployees = result.data
    ?.filter((employee) => (filters.campus === 'All' ? true : employee.campus === filters.campus))
    .filter((employee) => (filters.section === 'All' ? true : employee.section === filters.section));

  return { ...result, data: filteredEmployees || [] };
}
