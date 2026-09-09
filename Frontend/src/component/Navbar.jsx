import React from 'react'
import { NavLink } from 'react-router'

const Navbar = () => {
  const linkClasses = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand Name */}
          <NavLink to="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-slate-900">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              F
            </span>
            <span>Feedback</span>
          </NavLink>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <NavLink to="/" className={linkClasses}>
              Home
            </NavLink>
            <NavLink to="/feedback" className={linkClasses}>
              Feedback
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Navbar