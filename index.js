const express = require('express');
const cors = require('cors');
const midtransClient = require('midtrans-client');
const { Resend } = require('resend');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey:
    process.env.MIDTRANS_SERVER_KEY ||
    'Mid-server-tKm2E-VdJKKfY-0HqMmjXJn_'
});


const resend = new Resend(
    process.env.RESEND_API_KEY
);

app.post('/api/get-token', async (req, res) => {

    try {

        const {
            order_id,
            gross_amount,
            customer_details
        } = req.body;


        if (!order_id || !gross_amount) {

            return res.status(400).json({
                error:
                'order_id dan gross_amount wajib diisi.'
            });

        }


        const transaction =
        await snap.createTransaction({

            transaction_details: {

                order_id:
                order_id,

                gross_amount:
                Math.round(
                    Number(gross_amount)
                )

            },


            customer_details:
            customer_details


        });


        res.json({

            snap_token:
            transaction.token

        });



    } catch (error) {


        console.error(
            'Midtrans Error:',
            error.message
        );


        res.status(500).json({

            error:
            error.message

        });


    }


});

app.post('/api/send-invoice', async (req, res) => {


    try {


        const {
            email,
            bookingCode,
            invoiceHTML
        } = req.body;



        if(
            !email ||
            !invoiceHTML
        ){


            return res.status(400)
            .json({

                success:false,

                error:
                "Email / invoice kosong"

            });


        }




const result =
await resend.emails.send({

    from:
    "Piturooms <onboarding@resend.dev>",


    to:[
      email
    ],


    subject:
    `Invoice Booking ${bookingCode}`,


    html:
    invoiceHTML

});




        res.json({

            success:true,

            data:
            result

        });



    } catch(error){


        console.error(
            "Resend Error:",
            error
        );



        res.status(500)
        .json({

            success:false,

            error:
            error.message

        });


    }


});

module.exports = app;
