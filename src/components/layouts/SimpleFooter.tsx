"use client";

import { useState, useEffect } from "react";
import { designSystem } from "@/lib/design-system";

export function SimpleFooter() {
  const [currentYear, setCurrentYear] = useState(2024);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gradient-to-br from-footer-bg-start via-footer-bg-mid to-footer-bg-end text-footer-text border-t border-footer-border">
      <div
        className={`${designSystem.container.maxWidth} mx-auto ${designSystem.container.padding} py-4`}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <p
            className={`text-footer-text-subtle ${designSystem.typography.small}`}
          >
            © {currentYear} Online Store. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-footer-text-subtle">
            <a href="#" className="hover:text-secondary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-secondary transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
