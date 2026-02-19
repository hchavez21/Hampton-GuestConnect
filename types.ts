export enum EmailType {
  WELCOME = 'WELCOME',
  RECOVERY = 'RECOVERY',
  LOST_FOUND = 'LOST_FOUND',
  CC_AUTH = 'CC_AUTH'
}

export interface SharedData {
  senderName: string;
  senderTitle: string;
  senderEmail: string;
  hotelName: string;
  guestName: string;
  guestEmail: string;
  confirmationNumber: string;
  arrivalDate: string;
  departureDate: string;
  roomNumber: string;
}

export interface WelcomeEmailData extends SharedData {
  stayReason: string;
  highlights: string;
  personalNote: string;
}

export interface RecoveryEmailData extends SharedData {
  stayDate: string;
  issueDescription: string;
  resolutionOffered: string;
  tone: 'Apologetic' | 'Formal' | 'Warm & Reassuring';
}

export interface LostFoundData extends SharedData {
  itemDescription: string;
  whereFound: string;
  pickupInstructions: string;
}

export interface CcAuthData extends SharedData {
  authReason: string;
  notes: string;
  attachedFileName?: string;
}

export type FormData = WelcomeEmailData | RecoveryEmailData | LostFoundData | CcAuthData;

export interface GeneratedEmail {
  subject: string;
  body: string;
}

export interface SentEmail extends GeneratedEmail {
  id: string;
  timestamp: string;
  recipientEmail: string;
  recipientName: string;
  status: 'Delivered' | 'Pending' | 'Failed';
  attachment?: string;
}

export interface AppSettings {
  defaultSenderName: string;
  defaultSenderTitle: string;
  defaultHotelName: string;
  autoSaveEnabled: boolean;
  highContrastMode: boolean;
}