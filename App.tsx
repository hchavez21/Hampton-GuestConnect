import React, { useState } from 'react';
import { EmailType, WelcomeEmailData, RecoveryEmailData, LostFoundData, CcAuthData, GeneratedEmail } from './types';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { generateEmailContent } from './services/geminiService';
import { Hexagon, HeartHandshake } from 'lucide-react';

const App: React.FC = () => {
  const [emailType, setEmailType] = useState<EmailType>(EmailType.WELCOME);
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);

  // Initial state helper
  const commonInitialState = {
    senderName: '',
    senderTitle: '',
    hotelName: 'Hampton Inn Downtown Kansas City Financial District',
    guestName: '',
    confirmationNumber: '',
    arrivalDate: '',
    departureDate: '',
    roomNumber: ''
  };

  const [welcomeData, setWelcomeData] = useState<WelcomeEmailData>({
    ...commonInitialState,
    stayReason: 'Leisure',
    highlights: '',
    personalNote: ''
  });

  const [recoveryData, setRecoveryData] = useState<RecoveryEmailData>({
    ...commonInitialState,
    stayDate: '',
    issueDescription: '',
    resolutionOffered: '',
    tone: 'Apologetic'
  });

  const [lostFoundData, setLostFoundData] = useState<LostFoundData>({
    ...commonInitialState,
    itemDescription: '',
    whereFound: '',
    pickupInstructions: 'Please visit the front desk to claim your item.'
  });

  const [ccAuthData, setCcAuthData] = useState<CcAuthData>({
    ...commonInitialState,
    authReason: 'Third Party Billing',
    notes: ''
  });

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedEmail(null);
    
    // Select data based on active tab
    let data;
    switch(emailType) {
      case EmailType.WELCOME: data = welcomeData; break;
      case EmailType.RECOVERY: data = recoveryData; break;
      case EmailType.LOST_FOUND: data = lostFoundData; break;
      case EmailType.CC_AUTH: data = ccAuthData; break;
      default: data = welcomeData;
    }
    
    try {
      const result = await generateEmailContent(emailType, data);
      setGeneratedEmail(result);
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const currentData = 
    emailType === EmailType.WELCOME ? welcomeData :
    emailType === EmailType.RECOVERY ? recoveryData :
    emailType === EmailType.LOST_FOUND ? lostFoundData :
    ccAuthData;

  const tabs = [
    { id: EmailType.WELCOME, label: 'Welcome / Pre-Arrival' },
    { id: EmailType.RECOVERY, label: 'Service Recovery' },
    { id: EmailType.LOST_FOUND, label: 'Lost & Found' },
    { id: EmailType.CC_AUTH, label: 'Credit Card Authorization' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#003da5] p-1.5 rounded-lg">
              <Hexagon className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-tight">Hampton GuestConnect</h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide">AI-POWERED COMMUNICATION ASSISTANT</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <HeartHandshake className="w-4 h-4" />
            <span>Making every guest experience memorable</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex flex-wrap justify-center gap-1 sm:gap-0">
            {tabs.map((tab) => (
               <button
                key={tab.id}
                onClick={() => { setEmailType(tab.id); setGeneratedEmail(null); }}
                className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  emailType === tab.id
                    ? 'bg-[#003da5] text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)] lg:min-h-[600px]">
          {/* Left Column: Input */}
          <div className="lg:col-span-5 h-full">
            <InputSection
              emailType={emailType}
              welcomeData={welcomeData}
              recoveryData={recoveryData}
              lostFoundData={lostFoundData}
              ccAuthData={ccAuthData}
              setWelcomeData={setWelcomeData}
              setRecoveryData={setRecoveryData}
              setLostFoundData={setLostFoundData}
              setCcAuthData={setCcAuthData}
              onGenerate={handleGenerate}
              isLoading={loading}
            />
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7 h-full">
            <OutputSection
              generatedEmail={generatedEmail}
              emailType={emailType}
              guestName={currentData.guestName}
              senderName={currentData.senderName}
              senderTitle={currentData.senderTitle}
              hotelName={currentData.hotelName}
              confirmationNumber={currentData.confirmationNumber}
              arrivalDate={currentData.arrivalDate}
              departureDate={currentData.departureDate}
              roomNumber={currentData.roomNumber}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;