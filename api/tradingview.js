export default async function handler(req, res) {
    try {
        // Test rapido via ?test=1
        if (req.query.test) {
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: process.env.TELEGRAM_CHAT_ID,
                    text: "Test OK — il bot funziona!",
                })
            });
            return res.status(200).json({ status: "test sent" });
        }

        // Solo POST
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        const alert = req.body;

        // Accettiamo solo messaggi testuali (TradingView può inviare stringhe)
        if (typeof alert !== "string") {
            return res.status(200).json({ status: "ignored_non_string" });
        }

        const text = alert.trim();
        const textLower = text.toLowerCase();

        // Verifica se contiene "rectangle" o "rettangolo" (case-insensitive)
        if (!textLower.includes("rectangle") && !textLower.includes("rettangolo")) {
            return res.status(200).json({ status: "ignored_no_rectangle" });
        }

        // Estrai il pair: prendiamo la parte prima della prima virgola
        // Esempio: "SOLUSDT, 4h Entering Rectangle" -> "SOLUSDT"
        const parts = text.split(",");
        if (parts.length < 1) {
            return res.status(200).json({ status: "ignored_bad_format" });
        }

        const pairCandidate = parts[0].trim();

        // Validazione semplice del pair: almeno 2 caratteri alfanumerici, senza spazi
        const pairValid = /^[A-Za-z0-9._-]{2,}$/;
        if (!pairValid.test(pairCandidate)) {
            return res.status(200).json({ status: "ignored_invalid_pair" });
        }

        const pair = pairCandidate.toUpperCase();

        // Componi il messaggio Telegram
        const message = `🚨 *Alert TradingView*\n\nSimbolo: *${pair}*\nEntrato su zona forte`;

        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: "Markdown"
            })
        });

        return res.status(200).json({ status: "ok_sent", pair });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
