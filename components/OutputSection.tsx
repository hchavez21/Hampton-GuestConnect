import React, { useState, useEffect } from 'react';
import { GeneratedEmail, EmailType, SentEmail } from '../types';
import { 
  Copy, 
  Check, 
  Sparkles, 
  Mail, 
  Code, 
  Eye, 
  Phone, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Paperclip, 
  RotateCcw,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface OutputSectionProps {
  generatedEmail: GeneratedEmail | null;
  emailType: EmailType;
  guestName: string;
  guestEmail: string;
  senderName: string;
  senderTitle: string;
  hotelName: string;
  confirmationNumber?: string;
  arrivalDate?: string;
  departureDate?: string;
  roomNumber?: string;
  onEmailSent: (email: SentEmail) => void;
  isHistorical?: boolean;
  onUndo?: () => void;
}

export const OutputSection: React.FC<OutputSectionProps> = ({ 
  generatedEmail, 
  emailType, 
  guestName,
  guestEmail,
  senderName,
  senderTitle,
  hotelName,
  confirmationNumber,
  arrivalDate,
  departureDate,
  roomNumber,
  onEmailSent,
  isHistorical = false,
  onUndo
}) => {
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [showRawHtml, setShowRawHtml] = useState(false);
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'undo_window' | 'sent'>('idle');
  const [undoCountdown, setUndoCountdown] = useState(5);

  // Check if there's an attachment to display
  const attachmentName = (generatedEmail as any)?.attachment || (generatedEmail as any)?.attachedFileName;

  useEffect(() => {
    if (sendState !== 'undo_window') return;
    
    if (undoCountdown > 0) {
      const timer = setTimeout(() => setUndoCountdown(v => v - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      finalizeSend();
    }
  }, [sendState, undoCountdown]);

  useEffect(() => {
    setSendState('idle');
    setUndoCountdown(5);
  }, [generatedEmail]);

  const blockquoteTitle = emailType === EmailType.CC_AUTH ? 'INSTRUCTIONS' : 'STAY HIGHLIGHTS';

  const finalizeSend = () => {
    if (!guestEmail || !generatedEmail) return;
    
    const sentEmail: SentEmail = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      recipientEmail: guestEmail,
      recipientName: guestName,
      subject: generatedEmail.subject,
      body: generatedEmail.body,
      status: 'Delivered'
    };
    
    onEmailSent(sentEmail);
    setSendState('sent');
  };

  const handleStartSend = () => {
    setSendState('undo_window');
    setUndoCountdown(5);
  };

  const handleUndoAction = () => {
    setSendState('idle');
    setUndoCountdown(5);
  };

  const getFullHtml = (bodyText: string) => {
    const styledBody = bodyText.replace(
      /<blockquote>/g, 
      `<blockquote style="background-color: #f8fafc; border-left: 4px solid #003da5; padding: 16px 20px; margin: 24px 0; border-radius: 0 4px 4px 0;">
       <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.05em;">${blockquoteTitle}</div>`
    );

    const title = senderTitle || 'General Manager';

    return `<!DOCTYPE html><html><body style="margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <div style="padding: 30px; border-bottom: 3px solid #003da5; background-color: white;">
          <img src="https://stories-editor.hilton.com/wp-content/uploads/2024/03/Hampton-by-Hilton-Logo-Color.png" width="120" />
        </div>
        <div style="padding: 40px; font-family: sans-serif; color: #334155;">
          ${styledBody}
          <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="margin: 0; font-weight: bold; color: #003da5;">${senderName || 'The Hampton Team'}</p>
            <p style="margin: 0; font-size: 12px; color: #999;">${title}</p>
          </div>
        </div>
      </div>
    </body></html>`;
  };

  const copyToClipboard = async (text: string, isSubject: boolean) => {
    try {
      if (isSubject) {
        await navigator.clipboard.writeText(text);
        setCopiedSubject(true);
        setTimeout(() => setCopiedSubject(false), 2000);
      } else {
        const fullHtml = getFullHtml(text);
        if (showRawHtml) {
          await navigator.clipboard.writeText(fullHtml);
        } else {
          const htmlBlob = new Blob([fullHtml], { type: "text/html" });
          const data = [new ClipboardItem({ "text/html": htmlBlob, "text/plain": new Blob([text], {type: 'text/plain'}) })];
          await navigator.clipboard.write(data);
        }
        setCopiedBody(true);
        setTimeout(() => setCopiedBody(false), 2000);
      }
    } catch (err) { console.error(err); }
  };

  if (!generatedEmail) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-300 bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
        <div className="bg-gray-50 p-8 rounded-full mb-6 border border-gray-100">
          <Mail className="w-12 h-12 opacity-10" />
        </div>
        <p className="text-xl font-black tracking-tight uppercase text-gray-200">Terminal</p>
        <p className="text-[10px] mt-2 font-bold uppercase tracking-[0.2em]">Awaiting Generation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in duration-700">
      {/* Client Toolbar */}
      <header className="p-4 bg-white border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isHistorical && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-green-100">
              <ShieldCheck className="w-3.5 h-3.5" /> Logged
            </div>
          )}
          {!isHistorical && sendState === 'idle' && (
            <button 
              onClick={handleStartSend}
              disabled={!guestEmail}
              className="bg-[#002d72] text-[#fdb913] px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-[#001e4d] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          )}
          {sendState === 'undo_window' && (
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Transmit in {undoCountdown}s
               </div>
               <button 
                onClick={handleUndoAction}
                className="flex items-center gap-1.5 text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-5 py-2.5 rounded-full transition-all"
               >
                  <RotateCcw className="w-4 h-4" /> Undo
               </button>
            </div>
          )}
          {sendState === 'sent' && (
             <div className="flex items-center gap-3 bg-green-50 text-green-700 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest animate-in zoom-in border border-green-100">
                <CheckCircle2 className="w-4 h-4" /> Delivered
             </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="h-6 w-[1px] bg-gray-100 mx-2"></div>
          <button 
            onClick={() => setShowRawHtml(!showRawHtml)}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#002d72] transition-all"
          >
            {showRawHtml ? <Eye className="w-4 h-4" /> : <Code className="w-4 h-4" />}
            {showRawHtml ? 'Preview' : 'HTML'}
          </button>
        </div>
      </header>

      {/* Message Header */}
      <div className="p-8 bg-gray-50/30 border-b border-gray-50 space-y-4">
        <div className="grid grid-cols-[80px_1fr] items-center">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">From</span>
          <span className="text-xs font-bold text-gray-500">hamptoninnmkcfd@gmail.com</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] items-center">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">To</span>
          <span className="text-xs font-black text-[#002d72] truncate tracking-tight">{guestName} &lt;{guestEmail}&gt;</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] items-center pt-2 border-t border-gray-100">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Subject</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-gray-900 tracking-tight">{generatedEmail.subject}</span>
            <button 
              onClick={() => copyToClipboard(generatedEmail.subject, true)}
              className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              {copiedSubject ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Attachment Display */}
        {attachmentName && (
          <div className="grid grid-cols-[80px_1fr] items-center pt-2 border-t border-gray-100">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">File</span>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 inline-flex w-fit shadow-sm">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-bold text-gray-600">{attachmentName}</span>
              <span className="text-[8px] font-black text-blue-400 uppercase bg-blue-50 px-1 rounded-sm ml-2">PDF</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Viewport */}
      <div className="flex-grow overflow-y-auto bg-white p-8 lg:p-12 custom-scrollbar relative">
        {showRawHtml ? (
          <textarea 
            readOnly
            value={getFullHtml(generatedEmail.body)}
            className="w-full h-full font-mono text-[10px] p-8 bg-slate-900 text-blue-200/80 rounded-3xl resize-none outline-none border border-slate-800 leading-relaxed"
          />
        ) : (
          <div className="max-w-[650px] mx-auto pb-20">
            <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/20 bg-white">
               <div className="p-10 border-b-[4px] border-[#003da5]">
                 <img src="https://stories-editor.hilton.com/wp-content/uploads/2024/03/Hampton-by-Hilton-Logo-Color.png" className="h-8" alt="Hampton Logo" />
               </div>
               
               <div className="p-10 lg:p-16 email-body-render text-slate-700 leading-relaxed text-[16px]">
                  <div dangerouslySetInnerHTML={{ __html: generatedEmail.body }} />
                  
                  <div className="mt-16 pt-10 border-t border-gray-50 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400 mb-2 font-black uppercase tracking-widest">Best regards,</p>
                      <p className="text-2xl font-black text-[#003da5] tracking-tighter">{senderName || 'Hampton Ambassador'}</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">{senderTitle || 'Guest Relations'}</p>
                    </div>
                    <div className="opacity-10 grayscale brightness-0">
                       <img src="https://stories-editor.hilton.com/wp-content/uploads/2024/03/Hampton-by-Hilton-Logo-Color.png" className="h-6" alt="Ghost Logo" />
                    </div>
                  </div>
               </div>

               <div className="bg-gray-50/40 p-6 text-center border-t border-gray-50">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-[8px] font-black text-gray-300 tracking-[0.4em] uppercase">Authentic • Caring • Thoughtful</span>
                  </div>
               </div>
            </div>
            
            <div className="mt-12 flex justify-center gap-4">
              <button 
                onClick={() => copyToClipboard(generatedEmail.body, false)}
                className="flex items-center gap-3 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#002d72] bg-white border border-gray-100 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                {copiedBody ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copiedBody ? 'Copied Content' : 'Copy Content'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .email-body-render h3 { font-size: 1.8rem; font-weight: 900; color: #002d72; margin-bottom: 2rem; letter-spacing: -0.04em; line-height: 1.1; }
        .email-body-render p { margin-bottom: 1.5rem; line-height: 1.7; }
        .email-body-render blockquote {
          background-color: #f8fafc; border-left: 6px solid #003da5; padding: 2.2rem; margin: 2.5rem 0; border-radius: 0 16px 16px 0;
          font-style: italic; color: #334155; position: relative; border-bottom: 1px solid #f1f5f9; border-top: 1px solid #f1f5f9;
        }
        .email-body-render blockquote::before {
          content: '${blockquoteTitle}'; display: block; font-style: normal; font-size: 9px; font-weight: 900; 
          text-transform: uppercase; color: #002d72; margin-bottom: 1rem; letter-spacing: 0.2em; opacity: 0.4;
        }
        .email-body-render strong { color: #002d72; font-weight: 900; }
        .email-body-render ul { list-style: none; padding-left: 0.5rem; margin-bottom: 2rem; }
        .email-body-render li { margin-bottom: 0.8rem; position: relative; padding-left: 1.5rem; }
        .email-body-render li::before { content: '•'; color: #003da5; font-weight: 900; position: absolute; left: 0; }
      `}</style>
    </div>
  );
};
