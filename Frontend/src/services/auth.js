// Mock service - replace with actual API calls
export const authService = {
  getEmployees: async () => {
    // Generate dynamic employee data with salaries
    const departments = ['Engineering', 'Management', 'Design', 'Sales', 'HR'];
    const designations = {
      'Engineering': ['Senior Developer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer'],
      'Management': ['Project Manager', 'Team Lead', 'Product Manager'],
      'Design': ['UI/UX Designer', 'Graphic Designer', 'Product Designer'],
      'Sales': ['Sales Executive', 'Account Manager', 'Business Development'],
      'HR': ['HR Manager', 'Recruiter', 'HR Specialist']
    };

    const generateEmployees = () => {
      const employees = [];
      for (let i = 1; i <= 15; i++) {
        const dept = departments[Math.floor(Math.random() * departments.length)];
        const deptDesignations = designations[dept];
        const designation = deptDesignations[Math.floor(Math.random() * deptDesignations.length)];
        
        // Generate realistic salary based on department and designation
        const baseSalary = Math.floor(Math.random() * 5000) + 4000;
        const deductions = Math.floor(baseSalary * 0.12); // 12% deductions
        
        employees.push({
          _id: `emp${i}`,
          employeeId: `EMP${String(i).padStart(3, '0')}`,
          name: `Employee ${i}`,
          email: `employee${i}@company.com`,
          department: dept,
          designation: designation,
          baseSalary: baseSalary,
          deductions: deductions,
          phone: `+1-555-${String(Math.random()).slice(2, 6)}`,
          joiningDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active'
        });
      }
      return employees;
    };

    return {
      employees: generateEmployees()
    };
  },

  deleteEmployee: async (employeeId) => {
    // Mock delete - in real app, this would call your API
    console.log('Deleting employee:', employeeId)
    return { success: true }
  }
}