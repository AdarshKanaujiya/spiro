import nodemailer from "nodemailer";

export const sendFeedback = async (req, res) => {
  const { email, feedback } = req.body;

  if (!email || !feedback) {
    return res.status(400).json({ message: "Email and feedback are required." });
  }

  console.log("Received feedback from:", email);

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
      to: process.env.FEEDBACK_RECEIVER_EMAIL || process.env.EMAIL,
      subject: "New Feedback from Spiro User",
      html: `
        <h3>New Feedback Received</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Feedback:</strong></p>
        <p>${feedback}</p>
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
