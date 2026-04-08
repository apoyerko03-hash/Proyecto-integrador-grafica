import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F5' }}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div style={{ display: 'flex', paddingTop: '64px' }}>
        <Sidebar isOpen={sidebarOpen} />
        <main style={{ flex: 1, transition: 'margin 0.3s', marginLeft: sidebarOpen ? '256px' : '0' }}>
          <div style={{ padding: '1.5rem' }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
