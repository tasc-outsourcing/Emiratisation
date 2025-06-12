import { Link, useLocation } from "wouter";
import { Shield, Calculator, Settings } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-gray-900">UAE Emiratisation Risk Assessment</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <button
                className={`nav-tab px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${
                  isActive("/") ? "active" : ""
                }`}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Risk Assessment
              </button>
            </Link>
            <Link href="/dashboard">
              <button
                className={`nav-tab px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${
                  isActive("/dashboard") ? "active" : ""
                }`}
              >
                <Settings className="w-4 h-4 mr-2" />
                Management Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
