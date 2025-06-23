export default function Footer() {
  return (
    <footer className="bg-tasc-primary text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm">
              © Copyright 2025 TASC Outsourcing. All rights reserved
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://tascoutsourcing.sa/en/terms-of-use" 
              target="_self" 
              className="text-white hover:text-tasc-yellow text-sm transition-colors"
            >
              Terms of use
            </a>
            <a 
              href="https://tascoutsourcing.sa/en/disclaimer" 
              target="_self" 
              className="text-white hover:text-tasc-yellow text-sm transition-colors"
            >
              Disclaimer
            </a>
            <a 
              href="https://tascoutsourcing.sa/en/privacy-policy" 
              target="_self" 
              className="text-white hover:text-tasc-yellow text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="https://tascoutsourcing.sa/en/fraud-scam-alert" 
              target="_self" 
              className="text-white hover:text-tasc-yellow text-sm transition-colors"
            >
              Fraud & Scam Alert
            </a>
            <a 
              href="https://tasclive.ramcoes.com/RVW" 
              target="_blank" 
              className="text-white hover:text-tasc-yellow text-sm transition-colors"
            >
              Employee Login
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}