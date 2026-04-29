import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Cases' },
  { to: '/investigate', label: 'Investigate' },
  { to: '/trends', label: 'Market' },
  { to: '/challenge', label: '⚡ Challenge' },
];

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: 12 }} transition={{ type: 'spring', stiffness: 300 }}>
              <ShieldAlert className="w-5 h-5 text-blue-600" />
            </motion.div>
            <span className="text-base font-bold text-gray-900 tracking-tight">
              ExitShock<span className="text-blue-600">AI</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase tracking-wider">Beta</span>
          </NavLink>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
