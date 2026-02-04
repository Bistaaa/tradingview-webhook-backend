export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }

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


        // Optional: verifica della secret
        const secret = req.headers["x-tradingview-secret"];
        if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const alert = req.body;

        const message = `🚨 *Alert TradingView*\n\n${JSON.stringify(alert, null, 2)}`;

        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: "Markdown"
            })
        });

        return res.status(200).json({ status: "ok" });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}