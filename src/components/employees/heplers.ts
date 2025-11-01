import { useQuery } from '@tanstack/react-query';
import { type EmployeeQueryFilters } from './employee-list.component';
import { type Employee } from './data-schema';
import { keepPreviousData } from '@tanstack/react-query';
import { fetcher } from '../../utilities/fetcher';
import type { EmployeeRegistrationFormValues } from './employee-registration-form.component';
import dayjs from 'dayjs';

export function useEmployee(id: string) {
  const result = useQuery({
    queryKey: ['employee', id],
    queryFn: () => fetcher<Employee>(`/employees/${id}`),
  });
  return result;
}

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

  if (filters.employee_type === 'teaching') {
    filteredEmployees = filteredEmployees.filter((employee) =>
      filters.section === 'All' ? true : employee.section === filters.section
    );
  }

  return { ...result, data: filteredEmployees };
}

export async function postEmployee(values: EmployeeRegistrationFormValues) {
  const payload = createPostPayload(values);

  const response = await fetcher<{ id: string }>('/employees', {
    method: 'POST',
    body: payload,
  });
  return response;
}

export async function putEmployee(id: string, values: EmployeeRegistrationFormValues) {
  const payload = createPostPayload(values);

  const response = await fetcher<{ id: string }>(`/employees/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return response;
}

function createPostPayload(values: EmployeeRegistrationFormValues) {
  const payload = {
    surname: values.surname,
    given_name: values.given_name,
    date_of_birth: dayjs(values.date_of_birth).format('YYYY-MM-DD'),
    gender: values.gender,
    nationality: values.nationality,
    nin: values.nin,
    telephone_number1: values.telephone_number1,
    telephone_number2: values.telephone_number2 || null,
    email_address: values.email_address || null,
    place_of_residence: values.place_of_residence,
    marital_status: values.marital_status,
    tin: values.tin || null,
    nssf_number: values.nssf_number || null,
    campus: values.campus,
    employee_type: values.employee_type,
    section: values.employee_type === 'teaching' ? values.section : null,
    job_title: values.job_title,
    employment_status: values.employment_status,
  };
  return payload;
}
