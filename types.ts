export enum EmailType {
  WELCOME = 'WELCOME',
  RECOVERY = 'RECOVERY',
  LOST_FOUND = 'LOST_FOUND',
  CC_AUTH = 'CC_AUTH'
}

export interface SharedData {
  senderName: string;
  senderTitle: string;
  hotelName: string;
  guestName: string;
  confirmationNumber: string;
  arrivalDate: string;
  departureDate: string;
  roomNumber: string;
}

export interface WelcomeEmailData extends SharedData {
  stayReason: string; // e.g., Business, Leisure, Anniversary
  highlights: string; // e.g., Complimentary Breakfast, Digital Key
  personalNote: string;
}

export interface RecoveryEmailData extends SharedData {
  stayDate: string; // Kept for reference, though arrival/departure covers this
  issueDescription: string;
  resolutionOffered: string; // e.g., Refund, Points, Future discount
  tone: 'Apologetic' | 'Formal' | 'Warm & Reassuring';
}

export interface LostFoundData extends SharedData {
  itemDescription: string;
  whereFound: string; // e.g. Room 302, Pool
  pickupInstructions: string; // e.g. Visit front desk, reply with address
}

export interface CcAuthData extends SharedData {
  authReason: string; // e.g. Third Party Billing, Advance Deposit
  notes: string;
}

export type FormData = WelcomeEmailData | RecoveryEmailData | LostFoundData | CcAuthData;

export interface GeneratedEmail {
  subject: string;
  body: string;
}