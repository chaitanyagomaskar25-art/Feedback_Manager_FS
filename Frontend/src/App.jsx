import React from 'react'
import { Outlet } from 'react-router'
import Navbar from './component/Navbar'

const App = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  )
}

export default App
