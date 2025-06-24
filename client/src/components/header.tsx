import tascLogo from "@assets/TASC-logo-White_1750589308306.webp";
import headerBg from "@assets/EmiratisationApp_1750589473984.jpg";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header 
      className="tasc-header relative overflow-hidden text-white"
      style={{
        backgroundImage: `url(${headerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '300px'
      }}
    >
      <div className="absolute inset-0 bg-[#004267] bg-opacity-70"></div>
      <div className="container mx-auto px-6 md:px-4 relative z-10 h-full flex flex-col justify-center py-8 md:py-12">
        {/* Desktop: Logo in top left, Button in top right */}
        <div className="hidden md:block absolute top-6 left-6">
          <img 
            src={tascLogo} 
            alt="TASC Outsourcing" 
            className="h-10"
          />
        </div>
        
        <div className="hidden md:block absolute top-4 right-4">
          <Button 
            className="bg-[#FFC500] hover:bg-[#FFD700] text-black font-semibold px-4 py-2"
            onClick={() => window.open('https://calendly.com/nirbhay-tascoutsourcing/30-mins-emiratisation-strategy-session-clone', '_blank')}
          >
            Book Emiratisation Call
          </Button>
        </div>

        <div className="text-center max-w-4xl mx-auto mt-8 md:mt-0">
          {/* Mobile: Centered logo */}
          <div className="md:hidden mb-6">
            <img 
              src={tascLogo} 
              alt="TASC Outsourcing" 
              className="h-16 mx-auto mb-4"
            />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 px-4 md:px-0">
            UAE Emiratisation Risk Assessment Tool
          </h1>
          <p className="text-lg md:text-xl text-gray-100 mb-2 px-4 md:px-0">
            Calculate your compliance risk and potential fines under MoHRE 2025 requirements
          </p>
          <p className="text-base text-gray-200 mb-6 px-4 md:px-0">
            Expert guidance for UAE business compliance
          </p>
          
          {/* Mobile button below text with padding */}
          <div className="md:hidden mt-6 px-6">
            <Button 
              className="bg-[#FFC500] hover:bg-[#FFD700] text-black font-semibold px-6 py-3 w-full text-lg"
              onClick={() => window.open('https://calendly.com/nirbhay-tascoutsourcing/30-mins-emiratisation-strategy-session-clone', '_blank')}
            >
              Book Emiratisation Call
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}