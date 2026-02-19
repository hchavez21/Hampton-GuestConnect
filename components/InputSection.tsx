import React, { useState, useRef } from 'react';
import { EmailType, WelcomeEmailData, RecoveryEmailData, LostFoundData, CcAuthData } from '../types';
import { Calendar, PenTool, Search, Gift, CreditCard, Upload, Mail, X, FileText, Save, Loader2 } from 'lucide-react';

interface InputSectionProps {
  emailType: EmailType;
  welcomeData: WelcomeEmailData;
  recoveryData: RecoveryEmailData;
  lostFoundData: LostFoundData;
  ccAuthData: CcAuthData;
  setWelcomeData: React.Dispatch<React.SetStateAction<WelcomeEmailData>>;
  setRecoveryData: React.Dispatch<React.SetStateAction<RecoveryEmailData>>;
  setLostFoundData: React.Dispatch<React.SetStateAction<LostFoundData>>;
  setCcAuthData: React.Dispatch<React.SetStateAction<CcAuthData>>;
  onGenerate: () => void;
  onSaveDraft: () => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  emailType,
  welcomeData,
  recoveryData,
  lostFoundData,
  ccAuthData,
  setWelcomeData,
  setRecoveryData,
  setLostFoundData,
  setCcAuthData,
  onGenerate,
  onSaveDraft,
  isLoading,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const currentData = 
      emailType === EmailType.WELCOME ? welcomeData :
      emailType === EmailType.RECOVERY ? recoveryData :
      emailType === EmailType.LOST_FOUND ? lostFoundData :
      ccAuthData;

    if (!currentData.guestName?.trim()) newErrors.guestName = 'Required';
    if (!currentData.guestEmail?.trim()) {
      newErrors.guestEmail = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentData.guestEmail)) {
      newErrors.guestEmail = 'Invalid email';
    }
    
    switch (emailType) {
      case EmailType.RECOVERY:
        if (!recoveryData.issueDescription?.trim()) newErrors.issueDescription = 'Required';
        if (!recoveryData.resolutionOffered?.trim()) newErrors.resolutionOffered = 'Required';
        break;
      case EmailType.LOST_FOUND:
        if (!lostFoundData.itemDescription?.trim()) newErrors.itemDescription = 'Required';
        if (!lostFoundData.whereFound?.trim()) newErrors.whereFound = 'Required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateClick = () => {
    if (validate()) {
      onGenerate();
    }
  };

  const updateField = (field: string, value: any) => {
    switch (emailType) {
      case EmailType.WELCOME: setWelcomeData(prev => ({ ...prev, [field]: value })); break;
      case EmailType.RECOVERY: setRecoveryData(prev => ({ ...prev, [field]: value })); break;
      case EmailType.LOST_FOUND: setLostFoundData(prev => ({ ...prev, [field]: value })); break;
      case EmailType.CC_AUTH: setCcAuthData(prev => ({ ...prev, [field]: value })); break;
    }
  };

  const handleSharedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name, value);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField('attachedFileName', file.name);
    }
  };

  const removeFile = () => {
    updateField('attachedFileName', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentData = 
    emailType === EmailType.WELCOME ? welcomeData :
    emailType === EmailType.RECOVERY ? recoveryData :
    emailType === EmailType.LOST_FOUND ? lostFoundData :
    ccAuthData;

  const FormRow = ({ label, children, error }: { label: string, children?: React.ReactNode, error?: string }) => (
    <div className="flex items-center gap-6 mb-5">
      <label className="w-1/3 text-[#002d72] font-bold text-sm text-right uppercase tracking-wider">
        {label}
      </label>
      <div className="flex-1 relative">
        {children}
        {error && <span className="absolute -bottom-5 left-0 text-red-500 text-[10px] font-bold uppercase tracking-tighter">{error}</span>}
      </div>
    </div>
  );

  const InputField = ({ name, value, type = "text", placeholder, icon: Icon }: any) => (
    <div className="relative group">
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleSharedChange}
        placeholder={placeholder}
        className={`w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#002d72]/10 focus:border-[#002d72] outline-none text-gray-700 text-sm font-medium transition-all ${Icon ? 'pr-10' : ''}`}
      />
      {Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#002d72]" />}
    </div>
  );

  return (
    <div className="bg-white p-2">
      <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
        <span className="w-4 h-[2px] bg-gray-200"></span>
        Guest Profile
      </h2>

      <div className="space-y-1">
        <FormRow label="Sender Name">
          <InputField name="senderName" value={currentData.senderName} placeholder="Your name" />
        </FormRow>

        <FormRow label="Title">
          <InputField name="senderTitle" value={currentData.senderTitle} placeholder="Your title" />
        </FormRow>

        <FormRow label="Guest">
          <InputField name="guestName" value={currentData.guestName} placeholder="Full name" />
        </FormRow>

        <FormRow label="Email" error={errors.guestEmail}>
          <InputField name="guestEmail" value={currentData.guestEmail} placeholder="guest@email.com" icon={Mail} />
        </FormRow>

        <div className="grid grid-cols-2 gap-4 ml-[33.33%] mb-5">
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-gray-400 uppercase">Arrival</label>
             <InputField name="arrivalDate" value={currentData.arrivalDate} type="date" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-gray-400 uppercase">Departure</label>
             <InputField name="departureDate" value={currentData.departureDate} type="date" />
          </div>
        </div>

        <FormRow label="Room">
          <InputField name="roomNumber" value={currentData.roomNumber} placeholder="###" />
        </FormRow>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
             <span className="w-4 h-[2px] bg-gray-200"></span>
             Context
          </h3>

          {emailType === EmailType.CC_AUTH && (
            <>
              <FormRow label="Auth Reason">
                <InputField name="authReason" value={ccAuthData.authReason} placeholder="e.g. Advance Deposit" />
              </FormRow>
              <FormRow label="Auth Form">
                <div className="space-y-3">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                  {!ccAuthData.attachedFileName ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all text-gray-400"
                    >
                      <Upload className="w-6 h-6" />
                      <div className="text-center">
                        <span className="text-xs font-bold uppercase tracking-wider">Select Form File</span>
                        <p className="text-[10px] opacity-70 mt-1">PDF, DOC, or Image (Max 5MB)</p>
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl animate-in zoom-in duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-blue-900 truncate max-w-[150px]">{ccAuthData.attachedFileName}</span>
                          <span className="text-[10px] text-blue-400 font-bold uppercase">Ready to Attach</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={removeFile}
                        className="p-1 hover:bg-blue-100 rounded-full text-blue-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </FormRow>
              <FormRow label="Notes">
                <textarea
                  name="notes"
                  value={ccAuthData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#002d72]/10 focus:border-[#002d72] outline-none text-gray-700 text-sm font-medium h-24 resize-none"
                  placeholder="Additional instructions for the guest..."
                />
              </FormRow>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 ml-[33.33%] flex flex-col gap-3">
        <button
          onClick={handleGenerateClick}
          disabled={isLoading}
          className="w-full bg-[#002d72] hover:bg-[#001e4d] text-[#fdb913] font-bold py-3 px-6 rounded-xl shadow-xl shadow-blue-900/10 transition-all flex items-center justify-center gap-3 text-sm active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PenTool className="w-4 h-4" />
          )}
          Generate Draft
        </button>
        
        <button
          onClick={onSaveDraft}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#002d72] transition-colors border border-gray-100 rounded-lg"
        >
          <Save className="w-3 h-3" /> Save Draft Now
        </button>
      </div>
    </div>
  );
};
