import { Github, Mail, Shield, User } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-zinc-950 border-t border-white/5 py-12 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-xs font-black text-white">CJ</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">CJMS</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Unified Crime & Judiciary Management System.
              Advanced forensics, case tracking, and procedural automation for a modern justice system.
            </p>
          </div>

          {/* Credits Section */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Development Team
            </h3>
            <ul className="space-y-2">
              {['Andrea', 'Mrinalini', 'Adwita'].map((name) => (
                <li key={name} className="text-zinc-400 text-sm hover:text-indigo-400 transition-colors cursor-default">
                  {name}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Connect
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:andrea.a2024@vitstudent.ac.in"
                className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                andrea.a2024@vitstudent.ac.in
              </a>
              <a
                href="https://github.com/and9221"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-zinc-800 transition-all">
                  <Github className="w-4 h-4" />
                </div>
                Github: and9221 , Mrinalini10

              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-xs">
            © {new Date().getFullYear()} CJMS Project. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
