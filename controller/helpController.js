import nodemailer from "nodemailer";

export const sendhelp = async (req, res) => {
  const { name, email, feedback } = req.body;

  if (!name || !email || !feedback) {
    return res.status(400).json({ message: "All fields are required." });
  }

  console.log("Received helpus from:", email);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Spiro Help" <${process.env.EMAIL}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL,
      subject: "New HELP REQUEST from Spiro User",
      html: `
        <h3>New HELP Request Received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${feedback}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully to", mailOptions.to);
    res.status(200).json({ message: "Help request sent successfully." });
  } catch (error) {
    console.error("Error sending help email:", error);
    res.status(500).json({ message: "Failed to send help request." });
  }
};
