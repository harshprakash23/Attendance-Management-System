import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddStudent from './components/AddStudent';
import RemoveStudent from './components/RemoveStudent';
import MarkAttendance from './components/MarkAttendance';
import DownloadReports from './components/DownloadReports';
import Trends from './components/Trends';
import StudentList from './components/StudentList'; // Placeholder or actual component
import AttendanceList from './components/AttendanceList'; // Placeholder or actual component
import './styles.css';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div className="main-content" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddStudent />} />
            <Route path="/remove" element={<RemoveStudent />} />
            <Route path="/attendance" element={<MarkAttendance />} />
            <Route path="/reports" element={<DownloadReports />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/students/all" element={<StudentList />} />
            <Route path="/attendance/all" element={<AttendanceList />} />
            {/* Optional: Add a catch-all route for 404 */}
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;