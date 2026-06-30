import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useMusic } from '../../context/MusicContext'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { showPlayer } = useMusic()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMenuToggle={() => setSidebarOpen(o => !o)} />
      <div className="flex flex-1 pt-14">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`flex-1 lg:ml-64 overflow-y-auto min-h-screen ${showPlayer ? 'pb-28' : 'pb-8'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
