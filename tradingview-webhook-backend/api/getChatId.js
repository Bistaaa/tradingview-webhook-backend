export default async function handler(req, res) {
    try {
        const response = await fetch(
            `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/getUpdates`
        );
        const data = await response.json();
        return res.status(200).json(data);
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}