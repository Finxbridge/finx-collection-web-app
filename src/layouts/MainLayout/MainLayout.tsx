/**
 * Main Layout Component
 * Primary layout wrapper with header, sidebar, and content area
 */

import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@components/layout/Sidebar/Sidebar'
import { TopBar } from '@components/layout/TopBar/TopBar'
import './MainLayout.css'

interface MainLayoutProps {
  children?: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-layout">
      <Sidebar />
      <TopBar />
      <main className="main-layout__content">
        {children || <Outlet />}
      </main>
    </div>
  )
}

export default MainLayout
