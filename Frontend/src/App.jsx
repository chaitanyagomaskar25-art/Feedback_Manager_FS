import React from 'react'
import { Outlet } from 'react-router'
import Navbar from './component/Navbar'
import Footer from './component/Footer'

const App = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 antialiased font-sans">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App