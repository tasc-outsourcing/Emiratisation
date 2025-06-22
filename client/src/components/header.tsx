import tascLogo from "@assets/TASC-logo-White_1750589308306.webp";
import headerBg from "@assets/EmiratisationApp_1750589473984.jpg";

export default function Header() {
  return (
    <header 
      className="tasc-header flex items-center justify-center text-white relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0, 66, 103, 0.9) 0%, rgba(0, 127, 173, 0.9) 100%), url(${headerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <img 
              src={tascLogo} 
              alt="TASC Outsourcing" 
              className="h-16 md:h-20 mx-auto mb-4"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            UAE Emiratisation Compliance Solutions
          </h1>
          <p className="text-lg md:text-xl text-gray-100 mb-2">
            Expert guidance for MoHRE 2025 regulations
          </p>
          <p className="text-base text-gray-200">
            Assess your compliance risk and get professional support
          </p>
        </div>
      </div>
    </header>
  );
}