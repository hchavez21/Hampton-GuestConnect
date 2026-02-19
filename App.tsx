import React, { useState, useEffect, useCallback } from 'react';
import { EmailType, WelcomeEmailData, RecoveryEmailData, LostFoundData, CcAuthData, GeneratedEmail, SentEmail, AppSettings } from './types';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { generateEmailContent } from './services/geminiService';
import { 
  HeartHandshake, 
  PlusCircle, 
  Send, 
  Inbox, 
  Clock, 
  Settings, 
  ChevronRight, 
  Search, 
  User, 
  Paperclip,
  Save,
  X,
  Trash2,
  RefreshCcw,
  CheckCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compose' | 'sent'>('compose');
  const [emailType, setEmailType] = useState<EmailType>(EmailType.CC_AUTH);
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [selectedSentEmail, setSelectedSentEmail] = useState<SentEmail | null>(null);
  const [sentHistory, setSentHistory] = useState<SentEmail[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasDraftInStorage, setHasDraftInStorage] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // App Settings State
  const [settings, setSettings] = useState<AppSettings>({
    defaultSenderName: 'Hampton Team Member',
    defaultSenderTitle: 'Front Office Lead',
    defaultHotelName: 'Hampton Inn Downtown Kansas City Financial District',
    autoSaveEnabled: true,
    highContrastMode: false
  });

  // Initial States
  const commonInitialState = {
    senderName: settings.defaultSenderName,
    senderTitle: settings.defaultSenderTitle,
    senderEmail: 'hamptoninnmkcfd@gmail.com',
    hotelName: settings.defaultHotelName,
    guestName: '',
    guestEmail: '',
    confirmationNumber: '',
    arrivalDate: '',
    departureDate: '',
    roomNumber: ''
  };

  const [welcomeData, setWelcomeData] = useState<WelcomeEmailData>({
    ...commonInitialState, stayReason: 'Leisure', highlights: '', personalNote: ''
  });
  const [recoveryData, setRecoveryData] = useState<RecoveryEmailData>({
    ...commonInitialState, stayDate: '', issueDescription: '', resolutionOffered: '', tone: 'Apologetic'
  });
  const [lostFoundData, setLostFoundData] = useState<LostFoundData>({
    ...commonInitialState, itemDescription: '', whereFound: '', pickupInstructions: 'Front desk.'
  });
  const [ccAuthData, setCcAuthData] = useState<CcAuthData>({
    ...commonInitialState, authReason: 'Third Party Billing', notes: ''
  });

  // Load settings and history from local storage
  useEffect(() => {
    const savedSettings = localStorage.getItem('hampton_app_settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      
      // Update form data with new defaults if they are currently using old defaults
      const updateDataWithDefaults = (prev: any) => ({
        ...prev,
        senderName: parsedSettings.defaultSenderName,
        senderTitle: parsedSettings.defaultSenderTitle,
        hotelName: parsedSettings.defaultHotelName
      });

      setWelcomeData(updateDataWithDefaults);
      setRecoveryData(updateDataWithDefaults);
      setLostFoundData(updateDataWithDefaults);
      setCcAuthData(updateDataWithDefaults);
    }

    const savedHistory = localStorage.getItem('hampton_sent_history');
    if (savedHistory) {
      setSentHistory(JSON.parse(savedHistory));
    }

    const savedDrafts = localStorage.getItem('hampton_current_drafts');
    if (savedDrafts) {
      setHasDraftInStorage(true);
    }
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (!settings.autoSaveEnabled) return;

    const timer = setTimeout(() => {
      const drafts = {
        emailType,
        welcomeData,
        recoveryData,
        lostFoundData,
        ccAuthData
      };
      localStorage.setItem('hampton_current_drafts', JSON.stringify(drafts));
      setLastSaved(new Date());
      setHasDraftInStorage(true);
    }, 10000); 

    return () => clearTimeout(timer);
  }, [emailType, welcomeData, recoveryData, lostFoundData, ccAuthData, settings.autoSaveEnabled]);

  const handleManualSave = () => {
    const drafts = {
      emailType,
      welcomeData,
      recoveryData,
      lostFoundData,
      ccAuthData
    };
    localStorage.setItem('hampton_current_drafts', JSON.stringify(drafts));
    setLastSaved(new Date());
    setHasDraftInStorage(true);
  };

  const handleLoadDraft = () => {
    const savedDrafts = localStorage.getItem('hampton_current_drafts');
    if (savedDrafts) {
      const parsed = JSON.parse(savedDrafts);
      setEmailType(parsed.emailType || EmailType.CC_AUTH);
      setWelcomeData(parsed.welcomeData);
      setRecoveryData(parsed.recoveryData);
      setLostFoundData(parsed.lostFoundData);
      setCcAuthData(parsed.ccAuthData);
      setHasDraftInStorage(false);
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('hampton_app_settings', JSON.stringify(newSettings));
    setIsSettingsOpen(false);

    // Apply new defaults to current forms
    const applyDefaults = (prev: any) => ({
      ...prev,
      senderName: newSettings.defaultSenderName,
      senderTitle: newSettings.defaultSenderTitle,
      hotelName: newSettings.defaultHotelName
    });

    setWelcomeData(applyDefaults);
    setRecoveryData(applyDefaults);
    setLostFoundData(applyDefaults);
    setCcAuthData(applyDefaults);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all sent history? This action cannot be undone.')) {
      setSentHistory([]);
      localStorage.removeItem('hampton_sent_history');
      setSelectedSentEmail(null);
    }
  };

  const handleResetDrafts = () => {
    if (confirm('Clear current drafts and reset to default?')) {
      localStorage.removeItem('hampton_current_drafts');
      setHasDraftInStorage(false);
      window.location.reload();
    }
  };

  const saveToHistory = (email: SentEmail) => {
    const newHistory = [email, ...sentHistory].slice(0, 50);
    setSentHistory(newHistory);
    localStorage.setItem('hampton_sent_history', JSON.stringify(newHistory));
  };

  const handleUndo = (id: string) => {
    const newHistory = sentHistory.filter(e => e.id !== id);
    setSentHistory(newHistory);
    localStorage.setItem('hampton_sent_history', JSON.stringify(newHistory));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedEmail(null);
    setSelectedSentEmail(null);
    
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

  const handleEmailSentCallback = (email: SentEmail) => {
    if (emailType === EmailType.CC_AUTH && ccAuthData.attachedFileName) {
      email.attachment = ccAuthData.attachedFileName;
    }
    saveToHistory(email);
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden">
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-[#002d72] p-8 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Settings className="w-6 h-6 text-[#fdb913]" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">App Settings</h2>
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest opacity-70">Personalize Workspace</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {/* Default Profile Section */}
              <section className="space-y-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Default Profile</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Sender Name</label>
                    <input 
                      type="text" 
                      value={settings.defaultSenderName}
                      onChange={(e) => setSettings({...settings, defaultSenderName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Title</label>
                    <input 
                      type="text" 
                      value={settings.defaultSenderTitle}
                      onChange={(e) => setSettings({...settings, defaultSenderTitle: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Hotel</label>
                    <input 
                      type="text" 
                      value={settings.defaultHotelName}
                      onChange={(e) => setSettings({...settings, defaultHotelName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* Preferences Section */}
              <section className="space-y-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Automation</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[#002d72] uppercase tracking-tight">Auto-save Drafts</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Saves inputs every 10s</span>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, autoSaveEnabled: !settings.autoSaveEnabled})}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.autoSaveEnabled ? 'bg-[#fdb913]' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoSaveEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </section>

              {/* Maintenance Section */}
              <section className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest pb-2">Danger Zone</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleClearHistory}
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Clear History
                  </button>
                  <button 
                    onClick={handleResetDrafts}
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    <RefreshCcw className="w-4 h-4" /> Reset Drafts
                  </button>
                </div>
              </section>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
              <button 
                onClick={() => handleSaveSettings(settings)}
                className="bg-[#002d72] text-[#fdb913] px-10 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:-translate-y-1 transition-all flex items-center gap-3"
              >
                <CheckCircle className="w-4 h-4" /> Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Navigation Rail (Left) */}
      <aside className="w-16 lg:w-20 bg-[#002d72] flex flex-col items-center py-6 gap-8 z-30">
        <div className="border-2 border-white w-10 h-10 flex items-center justify-center rotate-45 mb-4 shadow-lg shadow-blue-900/50">
          <span className="-rotate-45 font-bold text-white text-xl">H</span>
        </div>
        
        <nav className="flex flex-col gap-6">
          <button 
            onClick={() => setActiveTab('compose')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'compose' ? 'bg-[#fdb913] text-[#002d72] shadow-lg shadow-yellow-500/20' : 'text-blue-200 hover:bg-blue-800'}`}
            title="Compose New"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveTab('sent')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'sent' ? 'bg-[#fdb913] text-[#002d72] shadow-lg shadow-yellow-500/20' : 'text-blue-200 hover:bg-blue-800'}`}
            title="Sent Items"
          >
            <Send className="w-6 h-6" />
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-6 text-blue-300">
          <button className="p-3 hover:text-white transition-colors"><Inbox className="w-6 h-6" /></button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 hover:text-white transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* 2. Workspace (Middle) */}
      <section className="w-full lg:w-[450px] bg-white border-r border-gray-100 flex flex-col z-20 shadow-xl">
        <header className="p-6 border-b border-gray-50 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-[#002d72] tracking-tight uppercase">
              {activeTab === 'compose' ? 'Compose' : 'Archive'}
            </h1>
            {activeTab === 'sent' && (
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-widest">
                {sentHistory.length} Logs
              </span>
            )}
            {activeTab === 'compose' && lastSaved && settings.autoSaveEnabled && (
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Save className="w-3 h-3" /> Auto-saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              placeholder={activeTab === 'compose' ? "Quick guest search..." : "Search logs..."}
              className="w-full bg-gray-50 border border-transparent rounded-xl pl-10 py-3 text-sm focus:ring-2 focus:ring-[#002d72]/10 focus:bg-white focus:border-[#002d72] transition-all outline-none"
            />
          </div>
        </header>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {activeTab === 'compose' ? (
            <div className="p-6">
              {hasDraftInStorage && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-center justify-between animate-in slide-in-from-top duration-500">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-bold text-yellow-800 uppercase tracking-tight">Saved draft found</span>
                  </div>
                  <button 
                    onClick={handleLoadDraft}
                    className="text-[10px] font-black uppercase tracking-widest text-[#002d72] hover:underline"
                  >
                    Restore
                  </button>
                </div>
              )}
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
                onSaveDraft={handleManualSave}
                isLoading={loading}
              />
            </div>
          ) : (
            <div className="flex flex-col">
              {sentHistory.length === 0 ? (
                <div className="p-20 text-center text-gray-300">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Clock className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-bold text-sm uppercase tracking-widest">Empty Archive</p>
                </div>
              ) : (
                sentHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedSentEmail(item);
                      setGeneratedEmail(null);
                    }}
                    className={`flex items-start gap-4 p-6 border-b border-gray-50 hover:bg-gray-50 transition-all text-left group relative ${selectedSentEmail?.id === item.id ? 'bg-blue-50/50' : ''}`}
                  >
                    {selectedSentEmail?.id === item.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#002d72]"></div>
                    )}
                    <div className={`p-2.5 rounded-xl transition-all ${selectedSentEmail?.id === item.id ? 'bg-[#002d72] text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold text-sm truncate ${selectedSentEmail?.id === item.id ? 'text-[#002d72]' : 'text-gray-800'}`}>
                          {item.recipientName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          {item.timestamp.split(',')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium truncate mb-2">{item.subject}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black px-1.5 py-0.5 bg-green-100 text-green-700 rounded-sm uppercase">Sent</span>
                        {item.attachment && (
                          <span className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase">
                            <Paperclip className="w-2.5 h-2.5" /> File
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. Client & Preview (Right) */}
      <main className="flex-grow bg-[#f8f9fb] overflow-hidden relative">
        <div className="absolute inset-0 flex flex-col p-6 lg:p-10">
          <OutputSection
            generatedEmail={selectedSentEmail || generatedEmail}
            emailType={emailType}
            guestName={selectedSentEmail ? selectedSentEmail.recipientName : currentData.guestName}
            guestEmail={selectedSentEmail ? selectedSentEmail.recipientEmail : currentData.guestEmail}
            senderName={currentData.senderName}
            senderTitle={currentData.senderTitle}
            hotelName={currentData.hotelName}
            confirmationNumber={currentData.confirmationNumber}
            arrivalDate={currentData.arrivalDate}
            departureDate={currentData.departureDate}
            roomNumber={currentData.roomNumber}
            onEmailSent={handleEmailSentCallback}
            isHistorical={!!selectedSentEmail}
            onUndo={() => {
              if(selectedSentEmail) {
                handleUndo(selectedSentEmail.id);
                setSelectedSentEmail(null);
              }
            }}
          />
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default App;
