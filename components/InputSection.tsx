import React, { useState } from 'react';
import { EmailType, WelcomeEmailData, RecoveryEmailData, LostFoundData, CcAuthData } from '../types';
import { Calendar, User, MessageSquare, AlertCircle, Gift, PenTool, Search, MapPin, Smile, UserCircle, AlertTriangle, Hash, DoorClosed, Briefcase, CreditCard, Upload } from 'lucide-react';

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
  isLoading,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const currentData = 
      emailType === EmailType.WELCOME ? welcomeData :
      emailType === EmailType.RECOVERY ? recoveryData :
      emailType === EmailType.LOST_FOUND ? lostFoundData :
      ccAuthData;

    // Common Validation
    if (!currentData.guestName?.trim()) newErrors.guestName = 'Guest name is required';
    
    // Specific Validation
    switch (emailType) {
      case EmailType.WELCOME:
        // arrivalDate is now shared, but still good to validate if needed
        break;
      case EmailType.RECOVERY:
        if (!recoveryData.issueDescription?.trim()) newErrors.issueDescription = 'Issue description is required';
        if (!recoveryData.resolutionOffered?.trim()) newErrors.resolutionOffered = 'Resolution details are required';
        break;
      case EmailType.LOST_FOUND:
        if (!lostFoundData.itemDescription?.trim()) newErrors.itemDescription = 'Item description is required';
        if (!lostFoundData.whereFound?.trim()) newErrors.whereFound = 'Found location is required';
        break;
      case EmailType.CC_AUTH:
        // No specific validation required yet, maybe authReason later
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

  const clearError = (name: string) => {
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
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
    clearError(name);
  };

  const currentData = 
    emailType === EmailType.WELCOME ? welcomeData :
    emailType === EmailType.RECOVERY ? recoveryData :
    emailType === EmailType.LOST_FOUND ? lostFoundData :
    ccAuthData;

  // Type-specific handlers
  const handleWelcomeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWelcomeData(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleRecoveryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRecoveryData(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleLostFoundChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLostFoundData(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleCcAuthChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCcAuthData(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const renderHeader = () => {
    switch (emailType) {
      case EmailType.WELCOME:
        return <><MessageSquare className="w-5 h-5 text-blue-600" /> Pre-Arrival / Welcome Details</>;
      case EmailType.RECOVERY:
        return <><AlertCircle className="w-5 h-5 text-red-600" /> Issue & Resolution Details</>;
      case EmailType.LOST_FOUND:
        return <><Search className="w-5 h-5 text-amber-600" /> Lost Item Details</>;
      case EmailType.CC_AUTH:
        return <><CreditCard className="w-5 h-5 text-emerald-600" /> CC Authorization Details</>;
    }
  };

  const getButtonColor = () => {
    if (isLoading) return 'bg-gray-400 cursor-not-allowed';
    switch (emailType) {
      case EmailType.WELCOME: return 'bg-blue-600 hover:bg-blue-700';
      case EmailType.RECOVERY: return 'bg-red-600 hover:bg-red-700';
      case EmailType.LOST_FOUND: return 'bg-amber-600 hover:bg-amber-700';
      case EmailType.CC_AUTH: return 'bg-emerald-600 hover:bg-emerald-700';
      default: return 'bg-blue-600';
    }
  };

  const getInputClass = (fieldName: string, isTextarea = false) => {
    const hasError = !!errors[fieldName];
    const base = `w-full ${isTextarea ? 'px-3' : 'pl-9 pr-3'} py-2 border rounded-lg outline-none transition-all`;
    
    if (hasError) {
      return `${base} border-red-500 bg-red-50 text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500`;
    }

    const focusColors = {
      [EmailType.WELCOME]: "focus:ring-blue-500 focus:border-blue-500",
      [EmailType.RECOVERY]: "focus:ring-red-500 focus:border-red-500",
      [EmailType.LOST_FOUND]: "focus:ring-amber-500 focus:border-amber-500",
      [EmailType.CC_AUTH]: "focus:ring-emerald-500 focus:border-emerald-500",
    };

    return `${base} border-gray-300 ${focusColors[emailType] || "focus:ring-blue-500 focus:border-blue-500"}`;
  };

  const ErrorMessage = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <div className="flex items-center gap-1 mt-1 text-red-600 text-xs animate-fadeIn">
        <AlertTriangle className="w-3 h-3" />
        <span>{errors[field]}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {renderHeader()}
      </h2>

      <div className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        
        {/* SHARED FIELDS */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest & Hotel Details</h3>
            
            {/* Guest Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guest Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                  <User className={`absolute left-3 top-2.5 w-4 h-4 ${errors.guestName ? 'text-red-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    name="guestName"
                    value={currentData.guestName}
                    onChange={handleSharedChange}
                    className={getInputClass('guestName')}
                    placeholder="Enter guest's full name (e.g. John Doe)"
                  />
              </div>
              <ErrorMessage field="guestName" />
            </div>

            {/* Sender Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sender Name</label>
                <div className="relative">
                  <UserCircle className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="senderName"
                    value={currentData.senderName}
                    onChange={handleSharedChange}
                    className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sender Title</label>
                 <div className="relative">
                  <Briefcase className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="senderTitle"
                    value={currentData.senderTitle}
                    onChange={handleSharedChange}
                    className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Enter your title"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2 border-t pt-2 border-gray-200">Reservation Info</h3>
            
            {/* Reservation Details Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Confirmation #</label>
                  <div className="relative">
                    <Hash className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="confirmationNumber"
                      value={currentData.confirmationNumber}
                      onChange={handleSharedChange}
                      className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="e.g. 8456213"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Room #</label>
                  <div className="relative">
                    <DoorClosed className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="roomNumber"
                      value={currentData.roomNumber}
                      onChange={handleSharedChange}
                      className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="e.g. 304"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Arrival Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      name="arrivalDate"
                      value={currentData.arrivalDate}
                      onChange={handleSharedChange}
                      className="w-full pl-9 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Departure Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      name="departureDate"
                      value={currentData.departureDate}
                      onChange={handleSharedChange}
                      className="w-full pl-9 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                    />
                  </div>
                </div>
            </div>
        </div>

        {/* TYPE SPECIFIC FIELDS */}
        {emailType === EmailType.WELCOME && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stay Reason</label>
              <select
                name="stayReason"
                value={welcomeData.stayReason}
                onChange={handleWelcomeChange}
                className={getInputClass('stayReason', true)}
              >
                <option value="Leisure">Leisure / Vacation</option>
                <option value="Business">Business Trip</option>
                <option value="Family Event">Family Event / Wedding</option>
                <option value="Loyalty Member">Loyalty Appreciation</option>
                <option value="Group Block">Group Block</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Highlights to Mention</label>
              <textarea
                name="highlights"
                value={welcomeData.highlights}
                onChange={handleWelcomeChange}
                rows={3}
                className={getInputClass('highlights', true)}
                placeholder="List amenities or highlights (e.g. Free hot breakfast, Digital Key...)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Personal Note</label>
              <textarea
                name="personalNote"
                value={welcomeData.personalNote}
                onChange={handleWelcomeChange}
                rows={2}
                className={getInputClass('personalNote', true)}
                placeholder="Add a personal note (e.g. I see you requested a high floor...)"
              />
            </div>
          </>
        )}

        {emailType === EmailType.RECOVERY && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <AlertCircle className={`absolute left-3 top-2.5 w-4 h-4 ${errors.issueDescription ? 'text-red-400' : 'text-gray-400'}`} />
                <textarea
                  name="issueDescription"
                  value={recoveryData.issueDescription}
                  onChange={handleRecoveryChange}
                  rows={3}
                  className={`${getInputClass('issueDescription', true)} pl-9`}
                  placeholder="Describe the issue (e.g. AC was loud in room 302...)"
                />
              </div>
              <ErrorMessage field="issueDescription" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution Offered <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Gift className={`absolute left-3 top-2.5 w-4 h-4 ${errors.resolutionOffered ? 'text-red-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  name="resolutionOffered"
                  value={recoveryData.resolutionOffered}
                  onChange={handleRecoveryChange}
                  className={getInputClass('resolutionOffered')}
                  placeholder="Resolution details (e.g. 10,000 Honors Points...)"
                />
              </div>
              <ErrorMessage field="resolutionOffered" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tone of Voice</label>
              <select
                name="tone"
                value={recoveryData.tone}
                onChange={handleRecoveryChange}
                className={getInputClass('tone', true)}
              >
                <option value="Apologetic">Deeply Apologetic</option>
                <option value="Formal">Formal & Professional</option>
                <option value="Warm & Reassuring">Warm & Reassuring</option>
              </select>
            </div>
          </>
        )}

        {emailType === EmailType.LOST_FOUND && (
          <>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-2.5 w-4 h-4 ${errors.itemDescription ? 'text-red-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  name="itemDescription"
                  value={lostFoundData.itemDescription}
                  onChange={handleLostFoundChange}
                  className={getInputClass('itemDescription')}
                  placeholder="Describe the item (e.g. Black iPhone charger, Blue Kids Jacket)"
                />
              </div>
              <ErrorMessage field="itemDescription" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Where it was Found <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-2.5 w-4 h-4 ${errors.whereFound ? 'text-red-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  name="whereFound"
                  value={lostFoundData.whereFound}
                  onChange={handleLostFoundChange}
                  className={getInputClass('whereFound')}
                  placeholder="Location found (e.g. Room 405, Pool Deck, Lobby)"
                />
              </div>
              <ErrorMessage field="whereFound" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup / Shipping Instructions</label>
              <textarea
                name="pickupInstructions"
                value={lostFoundData.pickupInstructions}
                onChange={handleLostFoundChange}
                rows={3}
                className={getInputClass('pickupInstructions', true)}
                placeholder="Instructions (e.g. Please reply with your shipping address or stop by the front desk...)"
              />
            </div>
          </>
        )}

        {emailType === EmailType.CC_AUTH && (
          <>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Authorization Reason</label>
              <select
                name="authReason"
                value={ccAuthData.authReason}
                onChange={handleCcAuthChange}
                className={getInputClass('authReason', true)}
              >
                <option value="Third Party Billing">Third Party Billing (Employer/Company)</option>
                <option value="Advance Deposit">Advance Deposit / Pre-payment</option>
                <option value="Relative Payment">Relative Paying for Stay</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Authorization Form</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <input
                    type="file"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-300 rounded-lg pl-10 cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Select the PDF form to include (Simulation Only)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                name="notes"
                value={ccAuthData.notes}
                onChange={handleCcAuthChange}
                rows={3}
                className={getInputClass('notes', true)}
                placeholder="Any special instructions for the guest..."
              />
            </div>
          </>
        )}

      </div>

      <div className="pt-4 mt-2 border-t border-gray-100">
        <button
          onClick={handleGenerateClick}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-medium transition-all shadow-md hover:shadow-lg ${getButtonColor()}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Copy...
            </>
          ) : (
            <>
              <PenTool className="w-5 h-5" />
              Generate Email
            </>
          )}
        </button>
      </div>
    </div>
  );
};