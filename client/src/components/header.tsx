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
      <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center py-8">
        {/* Desktop: Button in top right, Mobile: Button below content */}
        <div className="hidden md:block absolute top-6 right-6">
          <Button 
            className="bg-[#FFC500] hover:bg-[#FFD700] text-black font-semibold px-6 py-3"
            onClick={() => window.open('https://calendly.com/nirbhay-tascoutsourcing/30-mins-emiratisation-strategy-session-clone', '_blank')}
          >
            Book Emiratisation Call
          </Button>
        </div>

        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-6">
            <img 
              src={tascLogo} 
              alt="TASC Outsourcing" 
              className="h-16 md:h-20 mx-auto mb-4"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            UAE Emiratisation Risk Assessment Tool
          </h1>
          <p className="text-lg md:text-xl text-gray-100 mb-2">
            Calculate your compliance risk and potential fines under MoHRE 2025 requirements
          </p>
          <p className="text-base text-gray-200 mb-6">
            Expert guidance for UAE business compliance
          </p>
          
          {/* Mobile button below text */}
          <div className="md:hidden mt-6">
            <Button 
              className="bg-[#FFC500] hover:bg-[#FFD700] text-black font-semibold px-6 py-3 w-full sm:w-auto"
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