const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'musaaman705@gmail.com', // <--- ERROR HERE
        pass: process.env.EMAIL_PASS || 'ibrahimMUSA2020'  // <--- ERROR HERE
    },
});