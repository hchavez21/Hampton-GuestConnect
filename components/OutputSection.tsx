import React, { useState } from 'react';
import { GeneratedEmail, EmailType } from '../types';
import { Copy, Check, Sparkles, Mail, Code, Eye, Phone } from 'lucide-react';

interface OutputSectionProps {
  generatedEmail: GeneratedEmail | null;
  emailType: EmailType;
  guestName: string;
  senderName: string;
  senderTitle: string;
  hotelName: string;
  confirmationNumber?: string;
  arrivalDate?: string;
  departureDate?: string;
  roomNumber?: string;
}

export const OutputSection: React.FC<OutputSectionProps> = ({ 
  generatedEmail, 
  emailType, 
  guestName,
  senderName,
  senderTitle,
  hotelName,
  confirmationNumber,
  arrivalDate,
  departureDate,
  roomNumber
}) => {
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [showRawHtml, setShowRawHtml] = useState(false);

  const blockquoteTitle = 
    emailType === EmailType.RECOVERY ? 'SERVICE RECOVERY' : 
    emailType === EmailType.LOST_FOUND ? 'ITEM DETAILS' : 
    emailType === EmailType.CC_AUTH ? 'INSTRUCTIONS' : 
    'STAY HIGHLIGHTS';

  const getFullHtml = (bodyText: string) => {
    // Inject inline styles for the blockquote
    const styledBody = bodyText.replace(
      /<blockquote>/g, 
      `<blockquote style="background-color: #f8fafc; border-left: 4px solid #003da5; padding: 16px 20px; margin: 24px 0; border-radius: 0 4px 4px 0;">
       <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.05em;">${blockquoteTitle}</div>`
    );

    const hasReservationInfo = confirmationNumber || arrivalDate || departureDate || roomNumber;
    const title = senderTitle || 'General Manager';

    // Reservation info block HTML
    const reservationHtml = hasReservationInfo ? `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; border-radius: 6px; margin-bottom: 30px;">
        <tr>
          <td style="padding: 16px 24px;">
             <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                   ${confirmationNumber ? `
                   <td valign="top" style="padding-bottom: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Confirmation</td>
                   ` : ''}
                   ${roomNumber ? `
                   <td valign="top" style="padding-bottom: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Room</td>
                   ` : ''}
                   ${arrivalDate ? `
                   <td valign="top" style="padding-bottom: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Arrival</td>
                   ` : ''}
                   ${departureDate ? `
                   <td valign="top" style="padding-bottom: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Departure</td>
                   ` : ''}
                </tr>
                <tr>
                   ${confirmationNumber ? `
                   <td valign="top" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #0f172a;">${confirmationNumber}</td>
                   ` : ''}
                   ${roomNumber ? `
                   <td valign="top" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #0f172a;">${roomNumber}</td>
                   ` : ''}
                   ${arrivalDate ? `
                   <td valign="top" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #0f172a;">${arrivalDate}</td>
                   ` : ''}
                   ${departureDate ? `
                   <td valign="top" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #0f172a;">${departureDate}</td>
                   ` : ''}
                </tr>
             </table>
          </td>
        </tr>
      </table>
    ` : '';

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${generatedEmail?.subject || 'Hampton Email'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <!-- Main Background with subtle geometric hint -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 40px 24px 40px; border-bottom: 3px solid #003da5;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" valign="middle">
                     <img src="https://stories-editor.hilton.com/wp-content/uploads/2024/03/Hampton-by-Hilton-Logo-Color.png?w=1224&q=75" alt="Hampton by Hilton Logo" width="120" style="display: block; border: 0; max-width: 100%; height: auto;" />
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #64748b; font-weight: 500; letter-spacing: 0.5px;">GUEST SERVICES</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 40px 40px 40px 40px; color: #334155; line-height: 1.6; font-size: 16px;">
              
              ${reservationHtml}

              ${styledBody}
              
              <!-- Signature -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 4px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #64748b; font-size: 14px;">Sincerely,</p>
                <p style="margin: 0; font-weight: bold; color: #003da5; font-size: 18px; font-family: Georgia, serif;">${senderName || 'General Manager'}</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">${title}</p>
              </div>

              <!-- Contact Information -->
              <div style="margin-top: 32px; background-color: #f8fafc; border-radius: 8px; padding: 24px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; color: #334155;">Contact Information</p>
                <p style="margin: 0 0 12px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #64748b;">Hampton Inn Downtown Kansas City Financial District</p>
                <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #64748b;">
                    <span style="display: inline-block; margin: 0 10px;">&#9742; 816-652-3160</span>
                    <span style="display: inline-block; margin: 0 10px;">&#9993; hamptoninnmkcfd@gmail.com</span>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer Visual Treatment -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 40px; border-top: 1px solid #f1f5f9;">
               <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                 <tr>
                   <td align="center">
                      <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 500; letter-spacing: 0.5px;">100% HAMPTON GUARANTEE™</p>
                   </td>
                 </tr>
               </table>
            </td>
          </tr>
          <!-- Bottom Accent Line -->
          <tr>
            <td height="4" style="background-color: #003da5;"></td>
          </tr>

        </table>
        
        <!-- Space below email -->
        <div style="height: 40px;"></div>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const copyToClipboard = async (text: string, isSubject: boolean) => {
    if (isSubject) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedSubject(true);
        setTimeout(() => setCopiedSubject(false), 2000);
      } catch (err) {
        console.error("Failed to copy subject", err);
      }
    } else {
      try {
        const fullHtml = getFullHtml(text);
        
        if (showRawHtml) {
            await navigator.clipboard.writeText(fullHtml);
        } else {
            const htmlBlob = new Blob([fullHtml], { type: "text/html" });
            const textBlob = new Blob([text], { type: "text/plain" }); 
            const data = [new ClipboardItem({ 
            "text/html": htmlBlob, 
            "text/plain": textBlob 
            })];
            await navigator.clipboard.write(data);
        }

        setCopiedBody(true);
        setTimeout(() => setCopiedBody(false), 2000);
      } catch (err) {
        console.error("Copy failed", err);
      }
    }
  };

  const getTheme = () => {
    switch (emailType) {
      case EmailType.RECOVERY: return { accent: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' };
      case EmailType.LOST_FOUND: return { accent: 'text-amber-600', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' };
      case EmailType.CC_AUTH: return { accent: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' };
      default: return { accent: 'text-blue-600', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' };
    }
  };

  const theme = getTheme();
  
  const hasReservationInfo = confirmationNumber || arrivalDate || departureDate || roomNumber;
  const title = senderTitle || 'General Manager';

  if (!generatedEmail) {
    return (
      <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 h-full flex flex-col items-center justify-center text-gray-400 p-8">
        <div className={`p-4 rounded-full ${theme.bg} mb-4`}>
          <Sparkles className={`w-8 h-8 ${theme.accent}`} />
        </div>
        <p className="text-lg font-medium">Ready to create</p>
        <p className="text-sm text-center max-w-xs mt-2">
          Fill out the details on the left and click Generate.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <Mail className="w-4 h-4" /> Email Preview
        </h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${theme.badge}`}>
          {emailType}
        </span>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-100">
        
        {/* Subject Line Block */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500">Subject Line</label>
            <button 
              onClick={() => copyToClipboard(generatedEmail.subject, true)}
              className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors font-medium"
            >
              {copiedSubject ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedSubject ? 'Copied' : 'Copy Text'}
            </button>
          </div>
          <div className="text-gray-900 font-medium text-lg">
            {generatedEmail.subject}
          </div>
        </div>

        {/* Email Content Area */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
             <div className="flex items-center gap-3">
                 <label className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                     {showRawHtml ? 'HTML Source Code' : 'Formatted Preview'}
                 </label>
                 <button 
                    onClick={() => setShowRawHtml(!showRawHtml)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
                    title={showRawHtml ? "Switch to Visual Preview" : "Switch to Code View"}
                 >
                    {showRawHtml ? (
                        <>
                           <Eye className="w-3 h-3" /> Show Preview
                        </>
                    ) : (
                        <>
                            <Code className="w-3 h-3" /> Show HTML
                        </>
                    )}
                 </button>
             </div>
             
             <button 
              onClick={() => copyToClipboard(generatedEmail.body, false)}
              className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors font-medium"
            >
              {copiedBody ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedBody ? 'Copied' : (showRawHtml ? 'Copy Code' : 'Copy Formatted')}
            </button>
          </div>
          
          {showRawHtml ? (
              // Raw HTML View
              <div className="bg-[#282c34] rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col">
                  <div className="bg-[#21252b] px-4 py-2 text-gray-400 text-xs flex items-center gap-2 border-b border-white/10 select-none">
                      <Code className="w-3 h-3" /> email-template.html
                  </div>
                  <textarea 
                    readOnly
                    value={getFullHtml(generatedEmail.body).trim()}
                    className="w-full h-[600px] p-4 font-mono text-[11px] leading-relaxed text-gray-300 bg-[#282c34] resize-none focus:outline-none custom-scrollbar"
                    style={{ whiteSpace: 'pre' }}
                    spellCheck={false}
                  />
              </div>
          ) : (
              // Formatted Preview View
              <div className="email-preview-wrapper bg-slate-100 py-8 font-sans text-gray-800 rounded-lg">
                 {/* Card Container */}
                 <div className="bg-white max-w-[600px] mx-auto rounded-lg overflow-hidden shadow-md">
                    
                    {/* Header */}
                    <div className="bg-white px-10 pt-8 pb-6 border-b-[3px] border-[#003da5] flex justify-between items-center">
                        <img 
                            src="https://stories-editor.hilton.com/wp-content/uploads/2024/03/Hampton-by-Hilton-Logo-Color.png?w=1224&q=75" 
                            alt="Hampton by Hilton Logo" 
                            className="h-16 w-auto object-contain"
                        />
                         <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Guest Services</span>
                    </div>

                    {/* Body Content */}
                    <div className="p-10 pb-6">
                        {/* Reservation Details */}
                        {hasReservationInfo && (
                           <div className="bg-slate-50 rounded-md p-5 mb-8">
                             <div className="grid grid-cols-4 gap-4 text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1.5">
                                {confirmationNumber && <div>Confirmation</div>}
                                {roomNumber && <div>Room</div>}
                                {arrivalDate && <div>Arrival</div>}
                                {departureDate && <div>Departure</div>}
                             </div>
                             <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-slate-800">
                                {confirmationNumber && <div>{confirmationNumber}</div>}
                                {roomNumber && <div>{roomNumber}</div>}
                                {arrivalDate && <div>{arrivalDate}</div>}
                                {departureDate && <div>{departureDate}</div>}
                             </div>
                           </div>
                        )}

                        <div 
                            className={`email-body-content text-[16px] leading-relaxed text-slate-700 ${emailType.toLowerCase()}`}
                            dangerouslySetInnerHTML={{ __html: generatedEmail.body }}
                        />

                        {/* Signature */}
                        <div className="mt-10 pt-8 border-t border-slate-100">
                            <p className="text-sm text-slate-500 mb-2">Sincerely,</p>
                            <p className="font-bold text-lg text-[#003da5] font-serif">{senderName || 'Jordan Smith'}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">{title}</p>
                        </div>

                         {/* Contact Information */}
                         <div className="bg-slate-50 rounded-lg p-6 text-center mt-8 border border-slate-100">
                            <h4 className="text-base font-bold text-slate-700 mb-2">Contact Information</h4>
                            <p className="text-sm text-slate-500 mb-3">Hampton Inn Downtown Kansas City Financial District</p>
                            <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> 816-652-3160</span>
                                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> hamptoninnmkcfd@gmail.com</span>
                            </div>
                         </div>
                    </div>

                    {/* Footer Visual Treatment */}
                    <div className="bg-slate-50 px-10 py-4 border-t border-slate-100 flex justify-center">
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">100% Hampton Guarantee™</p>
                    </div>
                    {/* Bottom Accent */}
                    <div className="h-1 bg-[#003da5]"></div>

                 </div>
              </div>
          )}

        </div>

      </div>

      <style>{`
        .email-body-content h3 {
          font-weight: 700;
          font-size: 1.25rem;
          color: #0f172a;
          margin-bottom: 1.25rem;
          margin-top: 0;
          letter-spacing: -0.01em;
        }
        .email-body-content p {
          margin-bottom: 1.15rem;
        }
        /* Visual Preview Blockquote */
        .email-body-content blockquote {
          background-color: #f8fafc; 
          border-left: 4px solid #003da5; 
          padding: 1.25rem 1.5rem;
          margin: 1.5rem 0;
          border-radius: 0 4px 4px 0;
          position: relative;
        }
        .email-body-content blockquote::before {
          content: '${blockquoteTitle}';
          display: block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }
        .email-body-content strong {
          color: #003da5; 
          font-weight: 600;
        }
        .email-body-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .email-body-content li {
          margin-bottom: 0.25rem;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #21252b; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280; 
        }
      `}</style>
    </div>
  );
};