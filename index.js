require('dotenv').config();
console.log("API KEY:", process.env.RESEND_API_KEY);
const express = require("express");
const { Resend } = require("resend");
const cors = require("cors");
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, message: "API attiva!" });
});

app.post("/send-swap-email", async (req, res) => {
  try {
    console.log("Richiesta ricevuta su /send-swap-email", req.body);
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { to, subject, html } = req.body || {};
    const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";
    if (!to || !subject || !html) {
      console.error("Campi mancanti:", { to, subject, html });
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const { data, error } = await resend.emails.send({ from: fromAddress, to, subject, html });
    if (error) {
      console.error("Errore invio email:", error);
      throw error;
    }
    res.status(200).json({ message: "Email inviata!", to, subject, data });
  } catch (error) {
    console.error("ERRORE INVIO EMAIL:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/swaps/:swapId/authorize', async (req, res) => {
  const { swapId } = req.params;
  console.log("Richiesta autorizzazione per swapId:", swapId);
  const { error } = await supabase
    .from('shift_swaps')
    .update({ status: 'authorized' })
    .eq('id', swapId);
  if (error) {
    console.error("Errore autorizzazione:", error);
    res.status(500).send('Errore durante l\'autorizzazione');
    return;
  }
  res.send('Scambio autorizzato!');
});

app.get('/api/swaps/:swapId/reject', async (req, res) => {
  const { swapId } = req.params;
  console.log("Richiesta rifiuto per swapId:", swapId);
  const { error } = await supabase
    .from('shift_swaps')
    .update({ status: 'rejected' })
    .eq('id', swapId);
  if (error) {
    console.error("Errore rifiuto:", error);
    res.status(500).send('Errore durante il rifiuto');
    return;
  }
  res.send('Scambio rifiutato!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server listening on port", port);
});