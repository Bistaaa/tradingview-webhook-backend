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

        // Solo POST da TradingView
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        const alert = req.body;

        // Ci interessa solo se TradingView manda testo puro
        if (typeof alert !== "string") {
            // Non è un messaggio testuale → ignoriamo
            return res.status(200).json({ status: "ignored_non_string" });
        }

        const text = alert.trim();

        // 1) Deve contenere "Rectangle"
        if (!text.includes("Rectangle")) {
            // Non è un alert che ci interessa → ignoriamo
            return res.status(200).json({ status: "ignored_no_rectangle" });
        }

        // 2) Struttura attesa:
        //    Esempi validi:
        //    "SOLUSDT, 4h Entering Rectangle"
        //    "EURUSD, 30 Entering Rectangle"
        //
        //    Pattern:
        //    <PAIR>, <TIMEFRAME> Entering Rectangle
        //
        //    Dove:
        //    - <PAIR> = prima parola (senza spazi) prima della virgola
        //    - <TIMEFRAME> = qualcosa tipo "4h", "1h", "30", "5", ecc.
        //
        // Regex:
        const pattern = /^(\S+),\s*([\d]+h?|[\d]+)\s+Entering Rectangle$/;

        const match = text.match(pattern);

        if (!match) {
            // Struttura diversa da quella che ci interessa → ignoriamo
            return res.status(200).json({ status: "ignored_pattern_mismatch" });
        }

        const pair = match[1];      // es. "SOLUSDT"
        const timeframe = match[2]; // es. "4h", "30", ecc. (se ti servirà in futuro)

        // Messaggio finale per Telegram
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

        return res.status(200).json({ status: "ok_sent" });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}