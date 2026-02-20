const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});


async function createTransporter() {
  try {
    const accessTokenResponse = await oAuth2Client.getAccessToken();

    const token =
      typeof accessTokenResponse === "string"
        ? accessTokenResponse
        : accessTokenResponse?.token;

    if (!token) {
      throw new Error("Failed to generate access token");
    }

    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      family: 4,
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: token,
      },
    });
  } catch (error) {
    console.error("Error creating transporter:", error);
    throw error;
  }
}


const sendEmail = async (to, subject, text, html) => {
  try {
    console.log("sendEmail function triggered");

    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"Banking System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


async function sendRegistrationEmail(userEmail, name) {
  console.log("sendRegistrationEmail called");

  const subject = "Welcome to Banking System";

  const text = `Hello ${name},

Thank you for registering at Banking System.
We're excited to have you on board!

Best regards,
The Banking System Team`;

  const html = `
    <p>Hello ${name},</p>
    <p>Thank you for registering at Banking System.</p>
    <p>We're excited to have you on board!</p>
    <p>Best regards,<br/>The Banking System Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  console.log("sendTransactionEmail called");

  const subject = "Transaction Notification";

  const text = `Hello ${name},

You have successfully completed a transaction of $${amount} to account ${toAccount}.

Best regards,
The Banking System Team`;

  const html = `
    <p>Hello ${name},</p>
    <p>You have successfully completed a transaction of $${amount} to account ${toAccount}.</p>
    <p>Best regards,<br/>The Banking System Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  console.log("sendTransactionFailureEmail called");

  const subject = "Transaction Failure Notification"; 

  const text = `Hello ${name},

Your transaction of $${amount} to account ${toAccount} failed.

Best regards,
The Banking System Team`;

  const html = `
    <p>Hello ${name},</p>
    <p>Your transaction of $${amount} to account ${toAccount} failed.</p>
    <p>Best regards,<br/>The Banking System Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}



module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};
