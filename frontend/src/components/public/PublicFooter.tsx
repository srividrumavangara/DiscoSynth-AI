import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="bg-[#080808] border-t border-[#1C1C1C] text-[#737373] text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-[#F5F5F5]">DiscoSynth</span>
              <span className="text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-[#191919] text-[#A3A3A3] border border-[#303030]">
                AI
              </span>
            </div>
            <p className="text-xs text-[#737373] max-w-sm leading-relaxed">
              Synthetic litigation metadata generator engineered for e-discovery benchmarking, model validation, and legal-tech software testing.
            </p>
            <p className="text-[11px] text-[#555555] font-mono pt-2">
              All generated records are fictional. No actual litigation documents are ingested or created.
            </p>
          </div>

          {/* Links: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F5F5F5] uppercase tracking-wider font-mono">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/platform" className="hover:text-[#F5F5F5] transition-colors">Overview</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#F5F5F5] transition-colors">How It Works</Link></li>
              <li><Link to="/features" className="hover:text-[#F5F5F5] transition-colors">Features</Link></li>
              <li><Link to="/app/generate" className="hover:text-[#F5F5F5] transition-colors">Generator</Link></li>
            </ul>
          </div>

          {/* Links: Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F5F5F5] uppercase tracking-wider font-mono">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/documentation" className="hover:text-[#F5F5F5] transition-colors">Documentation</Link></li>
              <li><Link to="/documentation#schema" className="hover:text-[#F5F5F5] transition-colors">Metadata Schema</Link></li>
              <li><Link to="/documentation#api" className="hover:text-[#F5F5F5] transition-colors">API Reference</Link></li>
              <li><Link to="/about" className="hover:text-[#F5F5F5] transition-colors">About & Ethics</Link></li>
            </ul>
          </div>

          {/* Links: Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F5F5F5] uppercase tracking-wider font-mono">Workspace</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-[#F5F5F5] transition-colors">Sign In</Link></li>
              <li><Link to="/signup" className="hover:text-[#F5F5F5] transition-colors">Create Account</Link></li>
              <li><Link to="/app/dashboard" className="hover:text-[#F5F5F5] transition-colors">Workspace</Link></li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#F5F5F5] transition-colors"
                >
                  GitHub Repository &rarr;
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#555555] font-mono">
          <span>&copy; {new Date().getFullYear()} DiscoSynth AI. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span>Synthetic Data Only</span>
            <span>Zero Confidential Input</span>
            <Link to="/about" className="hover:text-[#A3A3A3] transition-colors">Responsible Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
