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
            return res.status(200).json({ status: "ignored_non_string" });
        }

        const text = alert.trim();
        const lower = text.toLowerCase();

        // Deve contenere "rectangle" o "rettangolo" (case-insensitive)
        if (!lower.includes("rectangle") && !lower.includes("rettangolo")) {
            return res.status(200).json({ status: "ignored_no_rectangle" });
        }

        // Estrarre il pair: prima parte prima della virgola
        const parts = text.split(",");
        if (parts.length < 1) {
            return res.status(200).json({ status: "ignored_no_pair" });
        }

        const pair = parts[0].trim();
        if (!pair) {
            return res.status(200).json({ status: "ignored_empty_pair" });
        }

        // Messaggio finale per Telegram
        const message = `🚨 *Alert TradingView*\n\nSimbolo: *${pair}*\nEntrato su zona forte`;

        await fetch(`https://api.telegram.org/bot(${process.env.TELEGRAM_TOKEN})/sendMessage`, {
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