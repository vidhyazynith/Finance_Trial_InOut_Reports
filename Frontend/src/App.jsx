import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
//import ReportBilling from './components/ReportBilling'


function App() {
  const { user } = useAuth()

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/admin/login" 
          element={!user ? <AdminLogin /> : <Navigate to="/admin/dashboard" />} 
        />
        <Route 
          path="/admin/dashboard" 
          element={user ? <AdminDashboard /> : <Navigate to="/admin/login" />} 
        />
        <Route path="/" element={<Navigate to="/admin/login" />} />
      </Routes>
    </div>
  )
}

export default App

// import React from 'react'
// import { Routes, Route, Navigate } from 'react-router-dom'
// import { useAuth } from './context/AuthContext'
// import AdminLogin from './components/AdminLogin'
// import AdminDashboard from './components/AdminDashboard'
// import InOutTransactions from './components/InOutTransactions'
// import Sidebar from './components/Sidebar'
// import { Box } from '@mui/material'

// // Placeholder components for other routes (you'll need to create these)
// const EmployeeManagement = () => <Box sx={{ p: 4 }}>Employee Management - Coming Soon</Box>
// const CustomerManagement = () => <Box sx={{ p: 4 }}>Customer Management - Coming Soon</Box>
// const SalaryManagement = () => <Box sx={{ p: 4 }}>Salary Management - Coming Soon</Box>
// const ReportsBilling = () => <Box sx={{ p: 4 }}>Reports & Billing - Coming Soon</Box>
// const HelpSupport = () => <Box sx={{ p: 4 }}>Help & Support - Coming Soon</Box>
// const Settings = () => <Box sx={{ p: 4 }}>Settings - Coming Soon</Box>

// function App() {
//   const { user } = useAuth()

//   // Layout component for authenticated routes with sidebar
//   const AuthenticatedLayout = ({ children }) => (
//     <Box sx={{ display: 'flex' }}>
//       <Sidebar />
//       <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
//         {children}
//       </Box>
//     </Box>
//   )

//   return (
//     <div className="App">
//       <Routes>
//         <Route 
//           path="/admin/login" 
//           element={!user ? <AdminLogin /> : <Navigate to="/admin/dashboard" />} 
//         />
        
//         {/* Authenticated Routes with Sidebar */}
//         <Route 
//           path="/admin/dashboard" 
//           element={
//             user ? (
//               <AuthenticatedLayout>
//                 <AdminDashboard />
//               </AuthenticatedLayout>
//             ) : (
//               <Navigate to="/admin/login" />
//             )
//           } 
//         />
        
//         <Route 
//           path="/admin/transactions" 
//           element={
//             user ? (
//               <AuthenticatedLayout>
//                 <InOutTransactions />
//               </AuthenticatedLayout>
//             ) : (
//               <Navigate to="/admin/login" />
//             )
//           } 
//         />
        
//         <Route 
//           path="/admin/employees" 
//           element={
//             user ? (
//               <AuthenticatedLayout>
//                 <EmployeeManagement />
//               </AuthenticatedLayout>
//             ) : (
//               <Navigate to="/admin/login" />
//             )
//           } 
//         />
        
//         <Route 
//           path="/admin/customers" 
//           element={
//             user ? (
//               <AuthenticatedLayout>
//                 <CustomerManagement />
//               </AuthenticatedLayout>
//             ) : (
//               <Navigate to="/admin/login" />
//             )
//           } 
//         />
        
//         <Route 
//           path="/admin/salary" 
//           element={
//             user ? (
//               <AuthenticatedLayout>
//                 <SalaryManagement />
//               </AuthenticatedLayout>
//             ) : (
//               <Navigate to="/admin/login" />
//             )
//           } 
//         />
        
//         <Route 
//           path="/admin/reports" 
//           element={
//             user ? (
//               <AuthenticatedLayout>
//                 <ReportsBilling />
//               </AuthenticatedLayout>
//             ) : (
//               <Navigate to="/admin/login" />
//             )
//           } 
//         />
        
//         <Route 
//           path="/admin/support" 
//           element={
//             user ? (
//               <AuthenticatedLayout>
//                 <HelpSupport />
//               </AuthenticatedLayout>
//             ) : (
//               <Navigate to="/admin/login" />
//             )
//           } 
//         />
        
//         <Route 
//           path="/admin/settings" 
//           element={
//             user ? (
//               <AuthenticatedLayout>
//                 <Settings />
//               </AuthenticatedLayout>
//             ) : (
//               <Navigate to="/admin/login" />
//             )
//           } 
//         />
        
//         <Route path="/" element={<Navigate to="/admin/login" />} />
//       </Routes>
//     </div>
//   )
// }

// export default App