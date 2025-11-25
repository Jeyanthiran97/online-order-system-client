"use client";

import { useState, useEffect } from "react";
import { designSystem } from "@/lib/design-system";

export function SimpleFooter() {
  const [currentYear, setCurrentYear] = useState(2024);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className={`${designSystem.container.maxWidth} mx-auto ${designSystem.container.padding} py-4`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <p className={`text-slate-400 ${designSystem.typography.small}`}>
            © {currentYear} Online Store. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-400">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

