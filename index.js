const express = require('express');
const cors = require('cors');
const midtransClient = require('midtrans-client');

const app = express();

// Mengizinkan laptop resepsionis mengakses server ini
app.use(cors({ origin: '*' }));
app.use(express.json());

// Inisialisasi Midtrans dengan Server Key kamu
const snap = new midtransClient.Snap({
    isProduction: false, // Ubah ke true jika sudah pakai akun Live (Uang asli)
    serverKey: 'MASUKKAN_SERVER_KEY_MIDTRANS_KAMU' // Ganti dengan Server Key milikmu
});

// Endpoint API untuk meminta token Midtrans
app.post('/api/get-token', async (req, res) => {
    try {
        const { order_id, gross_amount, customer_details } = req.body;

        const transaction = await snap.createTransaction({
            "transaction_details": { 
                "order_id": order_id, 
                "gross_amount": gross_amount 
            },
            "customer_details": customer_details
        });

        // Kirim balik tokennya ke laptop resepsionis
        res.json({ snap_token: transaction.token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Server berjalan di port 3000 jika ditest di komputer lokal
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server aktif di port ${PORT}`));

module.exports = app;