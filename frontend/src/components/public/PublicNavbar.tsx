import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PublicNavbar() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { name: 'Platform', path: '/platform' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Features', path: '/features' },
    { name: 'Documentation', path: '/documentation' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[#080808]/95 backdrop-blur-md border-b border-[#262626] py-3.5'
          : 'bg-[#080808] border-b border-[#1C1C1C] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Wordmark */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-semibold text-sm tracking-tight text-[#F5F5F5] group-hover:text-white transition-colors">
            DiscoSynth
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#191919] text-[#A3A3A3] border border-[#303030]">
            AI
          </span>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-[#F5F5F5] font-semibold'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#141414] border border-[#2D2D2D] hover:border-[#404040] text-xs transition-colors"
              >
                <div className="h-5 w-5 rounded bg-[#2B2B2B] flex items-center justify-center text-[10px] font-mono text-[#F5F5F5]">
                  {user.avatarLetter}
                </div>
                <span className="text-[#A3A3A3] max-w-[120px] truncate">{user.name}</span>
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-52 rounded-lg bg-[#111111] border border-[#303030] shadow-2xl p-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-[#222222] mb-1">
                    <p className="font-medium text-[#F5F5F5] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#737373] truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/app/dashboard"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center justify-between px-3 py-2 rounded text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#191919] transition-colors"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdown(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded text-[#A3A3A3] hover:text-white hover:bg-[#191919] transition-colors text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              <Link
                to="/app/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F5F5F5] hover:bg-white text-[#080808] text-xs font-semibold transition-all ml-2"
              >
                <span>Workspace</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-medium text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors px-2 py-1.5"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#F5F5F5] hover:bg-white text-[#080808] text-xs font-semibold transition-colors"
              >
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 text-[#A3A3A3] hover:text-[#F5F5F5]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0C0C0C] border-b border-[#262626] px-6 py-5 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `text-xs font-medium py-1 transition-colors ${
                    isActive ? 'text-[#F5F5F5] font-semibold' : 'text-[#A3A3A3]'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#1F1F1F] flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to="/app/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 rounded-md bg-[#F5F5F5] text-[#080808] text-xs font-semibold text-center"
              >
                Open Workspace
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2 rounded-md bg-[#161616] text-[#F5F5F5] text-xs font-medium text-center border border-[#2E2E2E]"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2 rounded-md bg-[#F5F5F5] text-[#080808] text-xs font-semibold text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
