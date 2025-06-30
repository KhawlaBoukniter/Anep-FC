const { json, response } = require('express');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // service: 'gmail', // Use your preferred service
    host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use `true` for port 465
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

// const transporter = nodemailer.createTransport({
//   host: 'smtp.office365.com',
//   port: 587,
//   secure: false, // use TLS
//   auth: {
//     user: 'your-email@outlook.com',
//     pass: 'your-email-password'
//   }
// });

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: to,
        subject: subject,
        html: await text // Ensure text is resolved to a string before passing it
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return { message: 'Email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { error: error };
    }
};
const activeAccount = async (url) => {
    const urlreset = url;
    return `
        <!doctype html>
        <html lang="en-US">
        
        <head>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
          <meta name="description" content="Reset Password Email Template.">
          <style type="text/css">
            a:hover {
              text-decoration: underline !important;
            }
          </style>
        </head>
        
        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
          <!--100% body table-->
          <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="font-family: 'Open Sans', sans-serif;">
            <tr>
              <td>
                <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="height:80px;"> </td>
                  </tr>
                  <tr>
                    <td style="text-align:center;">
                      <a href="http://localhost:5173/" title="logo" target="_blank">
                        <img width="400" src="https://www.dreamjob.ma/wp-content/uploads/2022/07/ANEP-Concours-Emploi-Recrutement.png" title="logo" alt="logo">
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="height:20px;"> </td>
                  </tr>
                  <tr>
                    <td>
                      <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                        <tr>
                          <td style="height:40px;"> </td>
                        </tr>
                        <tr>
                          <td style="padding:0 35px;">
                            <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Vous avez demandé d'activer votre compte</h1>
                            <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                               Un lien unique pour créer/réinitialiser votre mot de passe a été généré pour vous. Cliquez sur le lien suivant et suivez les instructions.
                            </p>
                            <a href="${urlreset}" style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">votre lien</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="height:40px;"> </td>
                        </tr>
                      </table>
                    </td>
                  <tr>
                    <td style="height:20px;"> </td>
                  </tr>
                  <tr>
                    <td style="text-align:center;">
                      <a href="https://www.anep.ma/" style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">© <strong>L'Agence Nationale des Équipements Publics</strong></a>
                    </td>
                  </tr>
                  <tr>
                    <td style="height:80px;"> </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <!--/100% body table-->
        </body>
        
        </html>`;
}
module.exports = {
    sendEmail,
    activeAccount,
  };