
import { GoogleGenAI } from "@google/genai";
import { EmailType, WelcomeEmailData, RecoveryEmailData, LostFoundData, CcAuthData, GeneratedEmail } from '../types';

// Use the correct API client initialization with the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEmailContent = async (
  type: EmailType,
  data: WelcomeEmailData | RecoveryEmailData | LostFoundData | CcAuthData
): Promise<GeneratedEmail> => {
  let prompt = "";
  let systemInstruction = "";

  const baseInstruction = `You are a professional and friendly hotel manager at a Hampton by Hilton. 
  Your tone should embody "Hamptonality": authentic, friendly, caring, and thoughtful. 
  Always format the output as a JSON object with two keys: "subject" and "body".
  The "body" must be formatted with simple HTML tags (<h3>, <p>, <strong>, <ul>, <li>, <blockquote>) for structure. 
  Do not use <html>, <head>, or <body> tags. 
  IMPORTANT: Do not include a sign-off (e.g., "Sincerely, [Name]") as this will be added automatically by the template.`;

  // Context for all emails
  const context = `
    Guest Name: ${data.guestName}
    Confirmation Number: ${data.confirmationNumber || 'N/A'}
    Arrival Date: ${data.arrivalDate || 'N/A'}
    Departure Date: ${data.departureDate || 'N/A'}
    Room Number: ${data.roomNumber || 'N/A'}
  `;

  switch (type) {
    case EmailType.WELCOME: {
      const d = data as WelcomeEmailData;
      systemInstruction = baseInstruction + " Be welcoming and helpful for an upcoming stay.";
      prompt = `
        Write a pre-arrival or welcome email.
        ${context}
        Reason for Stay: ${d.stayReason}
        Highlights: ${d.highlights}
        Personal Note: ${d.personalNote}
        
        Body requirements: Use <h3> for a warm headline. Put the key highlights in a <blockquote> tag for emphasis.
      `;
      break;
    }
    case EmailType.RECOVERY: {
      const d = data as RecoveryEmailData;
      systemInstruction = baseInstruction + ` Handle a service recovery situation. Tone: ${d.tone}. Goal: Restore confidence.`;
      prompt = `
        Write a service recovery email.
        ${context}
        Stay Date: ${d.stayDate || d.arrivalDate}
        Issue: ${d.issueDescription}
        Resolution: ${d.resolutionOffered}
        
        Body requirements: Acknowledge the issue sincerely. Put the resolution/compensation details inside a <blockquote> tag to make it stand out. Use <strong> for the specific amount/offer.
      `;
      break;
    }
    case EmailType.LOST_FOUND: {
      const d = data as LostFoundData;
      systemInstruction = baseInstruction + " Notify a guest about a lost item found on property. Be helpful and reassuring.";
      prompt = `
        Write a lost and found notification email.
        ${context}
        Item Description: ${d.itemDescription}
        Where Found: ${d.whereFound}
        Action Required/Instructions: ${d.pickupInstructions}
        
        Body requirements: Clear headline. Put the item description and where it was found in a <blockquote> tag.
      `;
      break;
    }
    case EmailType.CC_AUTH: {
      const d = data as CcAuthData;
      systemInstruction = baseInstruction + " Request a guest to fill out the attached credit card authorization form.";
      prompt = `
        Write an email asking the guest to fill out the attached Credit Card Authorization form.
        ${context}
        Reason for Form: ${d.authReason}
        Additional Notes: ${d.notes}
        
        Body requirements: Explain clearly why the form is needed (security, third-party payment). Mention explicitly that the form is ATTACHED to this email. Put important instructions (like please return by date X) in a <blockquote> tag.
      `;
      break;
    }
  }

  try {
    // Upgraded model to gemini-3-flash-preview for text generation tasks per guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    // Access the .text property directly.
    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(jsonText);
    return {
      subject: parsed.subject || "Information regarding your stay",
      body: parsed.body || "<p>Content generation failed.</p>",
    };

  } catch (error) {
    console.error("Error generating email:", error);
    return {
      subject: "Error",
      body: "<p>An error occurred while generating the email. Please try again.</p>",
    };
  }
};
