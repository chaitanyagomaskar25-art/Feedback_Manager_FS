import React from 'react'
import { NavLink } from 'react-router'

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <NavLink to="/" className="flex items-center space-x-2 text-xl font-bold text-white">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                A
              </span>
              <span>AppBrand</span>
            </NavLink>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering your experience with modern web solutions. Built for performance and designed with simplicity.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <NavLink to="/" className="hover:text-white transition-colors">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/feedback" className="hover:text-white transition-colors">
                  Feedback
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact/Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Connect With Us
            </h3>
            <p className="text-sm text-slate-400 mb-2">
              Have questions or suggestions? We'd love to hear from you.
            </p>
            <NavLink
              to="/feedback"
              className="inline-flex items-center justify-center px-4 py-2 border border-slate-700 text-sm font-medium rounded-lg text-white hover:bg-slate-800 transition-colors"
            >
              Send Feedback
            </NavLink>
          </div>

        </div>

        {/* Bottom Bar / Copyright */}
        <div className="pt-8 border-t border-slate-800 text-xs text-center sm:text-left flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-slate-500">
          <p>&copy; {new Date().getFullYear()} AppBrand Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer