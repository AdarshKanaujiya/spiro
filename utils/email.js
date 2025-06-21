import nodemailer from "nodemailer";

const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"SpirocDac Support" <${process.env.EMAIL}>`,
      to: email,
      subject: "Your OTP Code for Account Verification",
      html : `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50;">👋 Hello!</h2>
            <p>Thank you for signing up. Here is your OTP:</p>
            <p style="font-size: 24px; font-weight: bold; background-color: #f1f1f1; padding: 10px; text-align: center; border-radius: 6px;">
              ${otp}
            </p>
            <p>This OTP is valid for <strong>3 minutes</strong>. Do not share it with anyone.</p>
            <br/>
            <p style="color: #777;">- SpirocDac Team</p>
          </div>
        </body>
        </html>
      `,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        Importance: 'High',
      },
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP sent to:", email);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email.");
  }
};

export default sendOtpEmail;
