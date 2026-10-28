import { Outlet } from 'react-router-dom'
import Navbar from './component/Navbar'
import Footer from './component/Footer'
import './App.css'
import { useAuth } from './auth/AuthContext'

const App = () => {
  const { sessionError } = useAuth()

  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        {sessionError && <div className="alert alert-offset" role="alert">{sessionError}</div>}
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App