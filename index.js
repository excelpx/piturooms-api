const express = require('express');
const cors = require('cors');
const midtransClient = require('midtrans-client');

const app = express();

// Mengizinkan laptop resepsionis mengakses server ini
app.use(cors({ origin: '*' }));
app.use(express.json());

// Inisialisasi Midtrans dengan Server Key kamu
// Server Key production (Mid-server-...) => isProduction harus true agar cocok dengan Client Key production di frontend.
const snap = new midtransClient.Snap({
    isProduction: false, // Ubah ke false untuk ujicoba Sandbox
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'Mid-server-tKm2E-VdJKKfY-0HqMmjXJn_'
});

// Endpoint API untuk meminta token Midtrans
app.post('/api/get-token', async (req, res) => {
    try {
        const { order_id, gross_amount, customer_details } = req.body;

        if (!order_id || !gross_amount) {
            return res.status(400).json({ error: 'order_id dan gross_amount wajib diisi.' });
        }

        const transaction = await snap.createTransaction({
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": Math.round(Number(gross_amount)) // Midtrans mewajibkan nominal bulat (integer)
            },
            "customer_details": customer_details
        });

        // Kirim balik tokennya ke laptop resepsionis
        res.json({ snap_token: transaction.token });
    } catch (error) {
        // Log detail error di server (Vercel logs) supaya mudah didiagnosa
        console.error('Midtrans createTransaction error:', error.message, error.ApiResponse || '');
        res.status(500).json({ error: error.message });
    }
});

// Server berjalan di port 3000 jika ditest di komputer lokal
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server aktif di port ${PORT}`));

module.exports = app;
