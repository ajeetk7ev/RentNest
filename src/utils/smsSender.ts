import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER!;

const client = Twilio(accountSid, authToken);

export const sendSms = async (to: string, message: string) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: twilioNumber,
      to,
    });

    console.log(`SMS sent to ${to}: SID=${response.sid}`);
    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
};
