import sgMail from '@sendgrid/mail'
import otpTemplate from '../mail/templates/emailVerification';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: any;
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const mailSender = async ({ to, subject, html }: SendEmailOptions) => {
  try {
    console.log(to);   
    const mailOptions = {
      from: "ajeetk8568@gmail.com", 
      to,
      subject,
      html,
    };


    const info = await sgMail.send(mailOptions);
    console.log("Email sent: " + info);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendOtpVerificationEmail = async (email: string, otp: string) => {
  try {
    const mailResponse = await mailSender({
      to: email,
      subject: "Otp Verification Email",
      html: otpTemplate(otp),
    });
    return mailResponse;
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
  }
};