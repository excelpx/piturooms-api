const express = require("express");
const cors = require("cors");
const midtransClient = require("midtrans-client");
const { Resend } = require("resend");


const app = express();


// =======================
// MIDDLEWARE
// =======================

app.use(
  cors({
    origin: "*",
    methods: [
      "GET",
      "POST",
      "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type"
    ]
  })
);


app.use(
  express.json()
);



// =======================
// MIDTRANS CONFIG
// =======================

const snap =
new midtransClient.Snap({

  isProduction:
  false,


  serverKey:
  process.env.MIDTRANS_SERVER_KEY ||
  "Mid-server-tKm2E-VdJKKfY-0HqMmjXJn_"

});



// =======================
// RESEND CONFIG
// =======================

const resend =
process.env.RESEND_API_KEY
?
new Resend(
  process.env.RESEND_API_KEY
)
:
null;




// =======================
// MIDTRANS SNAP TOKEN
// =======================


app.post(
"/api/get-token",
async (req,res)=>{


try{


const {
 order_id,
 gross_amount,
 customer_details
}
=
req.body;



if(
 !order_id ||
 !gross_amount
){


return res
.status(400)
.json({

 error:
 "order_id dan gross_amount wajib diisi"

});


}



const transaction =
await snap.createTransaction({


 transaction_details:{

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



return res.json({

 snap_token:
 transaction.token

});



}catch(error){


console.error(
 "MIDTRANS ERROR:",
 error
);



return res
.status(500)
.json({

 error:
 error.message

});


}


});





// =======================
// SEND INVOICE EMAIL
// =======================


app.post(
"/api/send-invoice",
async (req,res)=>{


try{


const {
 email,
 bookingCode,
 invoiceHTML
}
=
req.body;




if(
 !email ||
 !invoiceHTML
){


return res
.status(400)
.json({

 success:false,

 error:
 "Email atau invoice kosong"

});


}




if(!resend){


return res
.status(500)
.json({

 success:false,

 error:
 "RESEND_API_KEY belum tersedia"

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




return res.json({

 success:true,

 data:
 result

});





}catch(error){



console.error(
 "RESEND ERROR:",
 error
);



return res
.status(500)
.json({

 success:false,

 error:
 error.message

});


}



});




// =======================
// VERCEL EXPORT
// =======================

module.exports = app;
