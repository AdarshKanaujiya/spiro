import nodemailer from "nodemailer";

export const sendcontact = async (req, res) => {
  const { name, email, feedback } = req.body;

  if (!name || !email || !feedback) {
    return res.status(400).json({ message: "All fields are required." });
  }

  console.log("Received contact from:", email);

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
      from: `"Spiro Feedback" <${process.env.EMAIL}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL,
      subject: "New CONTACTUS REQUEST from Spiro User",
      html: `
        <h3>New CONTACTUS Received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Details:</strong></p>
        <pre>${feedback}</pre>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully to", mailOptions.to);
    res.status(200).json({ message: "Feedback sent successfully." });
  } catch (error) {
    console.error("Error sending feedback email:", error);
    res.status(500).json({ message: "Failed to send feedback." });
  }
};
