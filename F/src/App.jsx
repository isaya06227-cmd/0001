// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RequireAuth from './Component/RequireAuth'

import Login from './Page/Login'
import Register from './Page/Register'
import Index_user from './Page/Index_user'
import MyWork_user from './Page/Mywork_user'
import SubmitWork from './Page/SubmitWork'
import Status_work from './Page/Status_work'
import Completed_work from './Page/Completed_work'
import Profile from './Page/Profile'

import Admin from './Page_admin/Admin'
import Dashboard_A from './Page_admin/Dashboard_A'
import MyWork_A from './Page_admin/Mywork_A'
import Completed_work_A from './Page_admin/Completed_work_A'
import Profile_A from './Page_admin/Profile_A'
import Status_work_A from './Page_admin/Status_work_A'
import SubmitWork_A from './Page_admin/SubmitWork_A'
import AddCustomer from './Page_admin/AddCustomer'
import Add_user from './Page_admin/Add_user'
import ManageUsers from './Page_admin/ManageUsers'
import ManageEmployees from './Page_admin/ManageEmployees'
import CheckWork from './Page_admin/CheckWork'
import AddProject from './Page_admin/AddProject'
import AddJob from './Page_admin/AddJob'
import EditData from './Page_admin/EditData'
import Work_completed from './Page_admin/work_completed'

function App() {
  return (
    <Router>
      <Routes>
        {/* หน้า Login ไม่ต้องล็อกอิน */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Pages (ล็อกอินก่อน) */}
        <Route path="/index_user" element={
          <RequireAuth><Index_user /></RequireAuth>
        } />
        <Route path="/Mywork_user" element={
          <RequireAuth><MyWork_user /></RequireAuth>
        } />
        <Route path="/SubmitWork" element={
          <RequireAuth><SubmitWork /></RequireAuth>
        } />
        <Route path="/Status_work" element={
          <RequireAuth><Status_work /></RequireAuth>
        } />
        <Route path="/Completed_work" element={
          <RequireAuth><Completed_work /></RequireAuth>
        } />
        <Route path="/Profile" element={
          <RequireAuth><Profile /></RequireAuth>
        } />

        {/* Admin Pages (ล็อกอินก่อน) */}
        <Route path="/Dashboard_A" element={
          <RequireAuth><Dashboard_A /></RequireAuth>
        } />
        <Route path="/Admin" element={
          <RequireAuth><Admin /></RequireAuth>
        } />
        <Route path="/MyWork_A" element={
          <RequireAuth><MyWork_A /></RequireAuth>
        } />
        <Route path="/Completed_work_A" element={
          <RequireAuth><Completed_work_A /></RequireAuth>
        } />
        <Route path="/Profile_A" element={
          <RequireAuth><Profile_A /></RequireAuth>
        } />
        <Route path="/Status_work_A" element={
          <RequireAuth><Status_work_A /></RequireAuth>
        } />
        <Route path="/SubmitWork_A" element={
          <RequireAuth><SubmitWork_A /></RequireAuth>
        } />
        <Route path="/AddCustomer" element={
          <RequireAuth><AddCustomer /></RequireAuth>
        } />
        <Route path="/Add_user" element={
          <RequireAuth><Add_user /></RequireAuth>
        } />
        <Route path="/ManageUsers" element={
          <RequireAuth><ManageUsers /></RequireAuth>
        } />
        <Route path="/ManageEmployees" element={
          <RequireAuth><ManageEmployees /></RequireAuth>
        } />
        <Route path="/CheckWork" element={
          <RequireAuth><CheckWork /></RequireAuth>
        } />
        <Route path="/AddProject" element={
          <RequireAuth><AddProject /></RequireAuth>
        } />
        <Route path="/AddJob" element={
          <RequireAuth><AddJob /></RequireAuth>
        } />
        <Route path="/EditData" element={
          <RequireAuth><EditData /></RequireAuth>
        } />

        <Route path="/work_completed" element={
          <RequireAuth><Work_completed /></RequireAuth>
        } />
      </Routes>
    </Router>
  )
}

export default App
