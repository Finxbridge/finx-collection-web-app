/**
 * Main Layout Component
 * Primary layout wrapper with header, sidebar, and content area
 */

import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import './MainLayout.css'

interface MainLayoutProps {
  children?: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <div className="main-layout__header-content">
          <h1 className="main-layout__logo">FinxCollection</h1>
          <nav className="main-layout__nav">
            {/* Navigation items */}
          </nav>
        </div>
      </header>

      <div className="main-layout__container">
        <aside className="main-layout__sidebar">
          {/* Sidebar content */}
          <nav className="main-layout__sidebar-nav">
            <a href="/dashboard">Dashboard</a>
            <a href="/profile">Profile</a>
            <a href="/settings">Settings</a>
          </nav>
        </aside>

        <main className="main-layout__content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
