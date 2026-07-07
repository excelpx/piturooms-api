export default async function handler(req, res) {
 if(req.method !== "POST"){
  return res.status(405).json({
   error:"Method not allowed"
  });
 }
 try{
  const {
   email,
   bookingCode,
   invoiceHTML
  } = req.body;
  const response =
  await fetch(
   "https://api.resend.com/emails",
   {
    method:"POST",
    headers:{
     "Authorization":
     `Bearer ${process.env.re_RyW85dfw_DDhDEF1YircG51M8m2ZU6kr8}`,
     "Content-Type":
     "application/json"
    },


    body:JSON.stringify({
     from:
     "Piturooms Hotel <onboarding@resend.dev>",
     to:
     email,
     subject:
     `Invoice Booking ${bookingCode}`,
     html:
     invoiceHTML
    })
   }
  );
  const data =
  await response.json();
  return res.json({
   success:true,
   data
  });
 }catch(error){
  return res.status(500)
  .json({
   success:false,
   error:error.message
  });
 }
}
