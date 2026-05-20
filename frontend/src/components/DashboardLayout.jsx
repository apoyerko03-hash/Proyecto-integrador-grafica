import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar />
      <main className="flex-1 ml-64 transition-all duration-300">
        <div className="p-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
