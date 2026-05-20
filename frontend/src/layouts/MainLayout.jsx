import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-bg-dark">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Área de Contenido */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
