import { EmployeeRegistrationForm } from './employee-registration-form.component';
import { Alert, Drawer } from 'antd';
import { useEmployee } from './heplers';

interface EmployeeEditFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  employeeId: string;
}

const EmployeeEditForm: React.FC<EmployeeEditFormProps> = ({ isOpen, setIsOpen, employeeId }) => {
  const { error, data: employee, isFetching } = useEmployee(employeeId);

  return (
    <Drawer width="960px" title="Edit Employee details" open={isOpen} onClose={() => setIsOpen(false)}>
      {isFetching ? (
        <div>Loading employee details...</div>
      ) : error ? (
        <Alert message="Error loading employee details" description={error?.message} type="error" showIcon closable />
      ) : (
        <EmployeeRegistrationForm mode="edit" initialValues={employee} closeForm={() => setIsOpen(false)} />
      )}
    </Drawer>
  );
};

export default EmployeeEditForm;
