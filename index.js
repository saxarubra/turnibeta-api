// require('dotenv').config();
console.log("API KEY:", process.env.RESEND_API_KEY);
const express = require("express");
const { Resend } = require("resend");
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, message: "API attiva!" });
});

app.post("/send-swap-email", async (req, res) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { to, subject, html } = req.body || {};
    const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";
    if (!to || !subject || !html) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    // const { data, error } = await resend.emails.send({ from: fromAddress, to, subject, html });
    // if (error) throw error;
    res.status(200).json({ message: "Email inviata (mock)!", to, subject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server listening on port", port);
});