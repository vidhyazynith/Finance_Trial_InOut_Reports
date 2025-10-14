// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { authService } from '../services/auth';
// import Sidebar from './Sidebar';
// import ReportsBilling from './Reports';
// import CustomerManagement from './CustomerManagement';
// import './AdminDashboard.css';
// import InOutTransactions from './InOutTransactions';
// import CompanySettings from './CompanySettings';

// const AdminDashboard = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeSection, setActiveSection] = useState('dashboard');

//   // Redirect if not authenticated
//   useEffect(() => {
//     if (!user) {
//       navigate('/admin/login');
//     }
//   }, [user, navigate]);

//   const loadEmployees = async () => {
//     setLoading(true);
//     try {
//       const data = await authService.getEmployees();
//       setEmployees(data.employees);
//     } catch (error) {
//       console.error('Error loading employees:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadEmployees();
//   }, []);

//   const handleDeleteEmployee = async (employeeId) => {
//     if (window.confirm('Are you sure you want to delete this employee?')) {
//       try {
//         await authService.deleteEmployee(employeeId);
//         loadEmployees();
//       } catch (error) {
//         console.error('Error deleting employee:', error);
//       }
//     }
//   };

//   const filteredEmployees = employees.filter(employee =>
//     employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleLogout = () => {
//     logout();
//     navigate('/admin/login');
//   };

//   // Dashboard statistics
//   const totalExpenses = 125000;
//   const monthlySalary = 180000;
//   const totalIncome = 320000;
//   const profit = totalIncome - totalExpenses;

//   return (
//     <div className="admin-dashboard">
//       {/* Fixed Sidebar */}
//       <Sidebar 
//         activeSection={activeSection} 
//         setActiveSection={setActiveSection}
//         onLogout={handleLogout}
//       />

//       {/* Main Content */}
//       <div className="main-content">
//         {/* Header */}
//         <header className="dashboard-header">
//           <div className="header-left">
//             <h1>{getSectionTitle(activeSection)}</h1>
//             <p>Welcome back, Admin</p>
//           </div>
//           <div className="header-right">
//             <div className="admin-user">
//               <span className="user-avatar">A</span>
//               <span className="user-name">Admin</span>
//             </div>
//             <button onClick={handleLogout} className="logout-btn">
//               Logout
//             </button>
//           </div>
//         </header>

//         {/* Dashboard Section */}
//         {activeSection === 'dashboard' && (
//           <div className="content-area">
//             <div className="stats-grid">
//               <div className="stat-card">
//                 <div className="stat-icon">👥</div>
//                 <div className="stat-content">
//                   <h3>Total Employees</h3>
//                   <span className="stat-number"></span>
//                   <span className="stat-change positive"></span>
//                 </div>
//               </div>
              
//               <div className="stat-card">
//                 <div className="stat-icon">💰</div>
//                 <div className="stat-content">
//                   <h3>Total Expenses</h3>
//                   <span className="stat-number">${totalExpenses.toLocaleString()}</span>
//                   <span className="stat-change negative">-5% from last month</span>
//                 </div>
//               </div>
              
//               <div className="stat-card">
//                 <div className="stat-icon">💵</div>
//                 <div className="stat-content">
//                   <h3>Monthly Salary</h3>
//                   <span className="stat-number">${monthlySalary.toLocaleString()}</span>
//                   <span className="stat-change positive">+3% from last month</span>
//                 </div>
//               </div>
              
//               <div className="stat-card">
//                 <div className="stat-icon">📈</div>
//                 <div className="stat-content">
//                   <h3>Total Income</h3>
//                   <span className="stat-number">${totalIncome.toLocaleString()}</span>
//                   <span className="stat-change positive">+12% from last month</span>
//                 </div>
//               </div>
//             </div>

//             <div className="charts-grid">
//               <div className="chart-card">
//                 <h3>Recent Salary Payments</h3>
//                 <div className="recent-payments">
//                   <div className="payment-row">
//                     <span className="payment-label">John Doe</span>
//                     <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
//                       <span className="payment-value amount">$8,500</span>
//                       <span className="payment-status completed">Completed</span>
//                     </div>
//                   </div>
//                   <div className="payment-row">
//                     <span className="payment-label">Jane Smith</span>
//                     <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
//                       <span className="payment-value amount">$7,200</span>
//                       <span className="payment-status completed">Completed</span>
//                     </div>
//                   </div>
//                   <div className="payment-row">
//                     <span className="payment-label">Mike Johnson</span>
//                     <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
//                       <span className="payment-value amount">$6,500</span>
//                       <span className="payment-status completed">Completed</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="chart-card">
//                 <h3>Income vs Expenses</h3>
//                 <div className="income-expenses">
//                   <div className="metric">
//                     <span className="metric-label">Income:</span>
//                     <span className="metric-value income">${totalIncome.toLocaleString()}</span>
//                   </div>
//                   <div className="metric">
//                     <span className="metric-label">Expenses:</span>
//                     <span className="metric-value expense">${totalExpenses.toLocaleString()}</span>
//                   </div>
//                   <div className="metric">
//                     <span className="metric-label">Profit:</span>
//                     <span className="metric-value profit">${profit.toLocaleString()}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Employee Management Section */}
//         {activeSection === 'employees' && (
//           <div className="content-area">
//             {/* Search and Filters */}
//             <div className="search-section">
//               <div className="search-box">
//                 <input
//                   type="text"
//                   placeholder="Search employees..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="search-input"
//                 />
//               </div>
//               <div className="filters">
//                 <select className="filter-select">
//                   <option>All Status</option>
//                   <option>Active</option>
//                   <option>Inactive</option>
//                 </select>
//                 <select className="filter-select">
//                   <option>All Departments</option>
//                   <option>Engineering</option>
//                   <option>Management</option>
//                   <option>Design</option>
//                 </select>
//               </div>
//             </div>

//             {/* Header with Add Button */}
//             <div className="section-header">
//               <h3>Employees ({filteredEmployees.length})</h3>
//               <button
//                 className="add-employee-btn"
//                 onClick={() => alert('Add Employee functionality would go here')}
//               >
//                 <span className="btn-icon">+</span>
//                 Add Employee
//               </button>
//             </div>

//             {/* Employees Table */}
//             <div className="employees-table-container">
//               <table className="employees-table">
//                 <thead>
//                   <tr>
//                     <th>Employee ID</th>
//                     <th>Name</th>
//                     <th>Designation</th>
//                     <th>Department</th>
//                     <th>Phone</th>
//                     <th>Joining Date</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td colSpan="7" className="loading-cell">
//                         Loading employees...
//                       </td>
//                     </tr>
//                   ) : filteredEmployees.length === 0 ? (
//                     <tr>
//                       <td colSpan="7" className="empty-cell">
//                         No employees found
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredEmployees.map(employee => (
//                       <tr key={employee._id} className="employee-row">
//                         <td>
//                           <div className="employee-info">
//                             <div className="employee-id">{employee.employeeId}</div>
//                           </div>
//                         </td>
//                         <td>
//                           <div className="employee-info">
//                             <div className="employee-name">{employee.name}</div>
//                             <div className="employee-email">{employee.email}</div>
//                           </div>
//                         </td>
//                         <td>{employee.designation}</td>
//                         <td>{employee.department}</td>
//                         <td>{employee.phone}</td>
//                         <td>{new Date(employee.joiningDate).toLocaleDateString()}</td>
//                         <td>
//                           <div className="action-buttons">
//                             <button 
//                               className="edit-btn"
//                               onClick={() => alert('Edit functionality would go here')}
//                             >
//                               Edit
//                             </button>
//                             <button
//                               className="delete-btn"
//                               onClick={() => handleDeleteEmployee(employee.employeeId)}
//                             >
//                               Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Reports Section */}
//         {activeSection === 'reports' && <ReportsBilling />}

//         {/* Customer Management Section */}
//         {activeSection === 'customers' && <CustomerManagement />}

//         {/* In/Out Transactions Section */}
//         {activeSection === 'transactions' && <InOutTransactions/>}

//         {/* Other Sections */}
//         {!['dashboard', 'employees', 'reports', 'customers'].includes(activeSection) && (
//           <div className="content-area">
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Helper function to get section title
// const getSectionTitle = (sectionId) => {
//   const sections = {
//     dashboard: 'Dashboard',
//     employees: 'Employee Management',
//     customers: 'Customer Management',
//     salary: 'Salary Management',
//     transactions: 'In/Out Transactions',
//     reports: 'Reports & Billing',
//     support: 'Help & Support',
//     settings: 'Settings'
//   };
//   return sections[sectionId] || 'Dashboard';
// };

// export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import Sidebar from './Sidebar';
import ReportsBilling from './Reports';
import CustomerManagement from './CustomerManagement';
import './AdminDashboard.css';
import InOutTransactions from './InOutTransactions';
import CompanySettings from './CompanySettings';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await authService.getEmployees();
      setEmployees(data.employees);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await authService.deleteEmployee(employeeId);
        loadEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Dashboard statistics
  const totalExpenses = 125000;
  const monthlySalary = 180000;
  const totalIncome = 320000;
  const profit = totalIncome - totalExpenses;

  return (
    <div className="admin-dashboard">
      {/* Fixed Sidebar */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>{getSectionTitle(activeSection)}</h1>
          </div>
          <div className="header-right">
            <div className="admin-user">
              <span className="user-avatar">A</span>
              <span className="user-name">Admin</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <div className="content-area">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>Total Employees</h3>
                  <span className="stat-number"></span>
                  <span className="stat-change positive"></span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>Total Expenses</h3>
                  <span className="stat-number">${totalExpenses.toLocaleString()}</span>
                  <span className="stat-change negative">-5% from last month</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">💵</div>
                <div className="stat-content">
                  <h3>Monthly Salary</h3>
                  <span className="stat-number">${monthlySalary.toLocaleString()}</span>
                  <span className="stat-change positive">+3% from last month</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>Total Income</h3>
                  <span className="stat-number">${totalIncome.toLocaleString()}</span>
                  <span className="stat-change positive">+12% from last month</span>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Recent Salary Payments</h3>
                <div className="recent-payments">
                  <div className="payment-row">
                    <span className="payment-label">John Doe</span>
                    <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                      <span className="payment-value amount">$8,500</span>
                      <span className="payment-status completed">Completed</span>
                    </div>
                  </div>
                  <div className="payment-row">
                    <span className="payment-label">Jane Smith</span>
                    <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                      <span className="payment-value amount">$7,200</span>
                      <span className="payment-status completed">Completed</span>
                    </div>
                  </div>
                  <div className="payment-row">
                    <span className="payment-label">Mike Johnson</span>
                    <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                      <span className="payment-value amount">$6,500</span>
                      <span className="payment-status completed">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="chart-card">
                <h3>Income vs Expenses</h3>
                <div className="income-expenses">
                  <div className="metric">
                    <span className="metric-label">Income:</span>
                    <span className="metric-value income">${totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Expenses:</span>
                    <span className="metric-value expense">${totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Profit:</span>
                    <span className="metric-value profit">${profit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employee Management Section */}
        {activeSection === 'employees' && (
          <div className="content-area">
            <div className="search-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="filters">
                <select className="filter-select">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <select className="filter-select">
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Management</option>
                  <option>Design</option>
                </select>
              </div>
            </div>

            <div className="section-header">
              <h3>Employees ({filteredEmployees.length})</h3>
              <button
                className="add-employee-btn"
                onClick={() => alert('Add Employee functionality would go here')}
              >
                <span className="btn-icon">+</span>
                Add Employee
              </button>
            </div>

            <div className="employees-table-container">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Joining Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="loading-cell">
                        Loading employees...
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-cell">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map(employee => (
                      <tr key={employee._id} className="employee-row">
                        <td>
                          <div className="employee-info">
                            <div className="employee-id">{employee.employeeId}</div>
                          </div>
                        </td>
                        <td>
                          <div className="employee-info">
                            <div className="employee-name">{employee.name}</div>
                            <div className="employee-email">{employee.email}</div>
                          </div>
                        </td>
                        <td>{employee.designation}</td>
                        <td>{employee.department}</td>
                        <td>{employee.phone}</td>
                        <td>{new Date(employee.joiningDate).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="edit-btn"
                              onClick={() => alert('Edit functionality would go here')}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteEmployee(employee.employeeId)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Section */}
        {activeSection === 'reports' && <ReportsBilling />}

        {/* Customer Management Section */}
        {activeSection === 'customers' && <CustomerManagement />}

        {/* In/Out Transactions Section */}
        {activeSection === 'transactions' && <InOutTransactions/>}

        {/* Settings Section - Direct Company Settings without tabs */}
        {activeSection === 'settings' && (
          <div className="content-area">
            <CompanySettings />
          </div>
        )}

        {/* Other Sections */}
        {!['dashboard', 'employees', 'reports', 'customers', 'transactions', 'settings'].includes(activeSection) && (
          <div className="content-area">
            {/* Default content for other sections */}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get section title
const getSectionTitle = (sectionId) => {
  const sections = {
    dashboard: 'Dashboard',
    employees: 'Employee Management',
    customers: 'Customer Management',
    salary: 'Salary Management',
    transactions: 'In/Out Transactions',
    reports: 'Reports & Billing',
    settings: 'Settings',
    support: 'Help & Support'
  };
  return sections[sectionId] || 'Dashboard';
};

export default AdminDashboard;