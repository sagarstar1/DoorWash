const twilio = require('twilio');
const sendOTP = async (phone, otp) => {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: `Your DoorWash OTP is: ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
module.exports = { sendOTP, generateOTP };
