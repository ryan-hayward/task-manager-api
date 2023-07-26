const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//send a welcome email based on user email and name
const sendWelcomeEmail = (email, name) => {
    //NOTE: send is async
    sgMail.send({
        to: email,
        from: 'rchayward99@gmail.com',
        subject: 'Thanks for joining.',
        text: `Welcome to the app, ${name}. Let me know how you like the app!`
    })
}

const sendCancelEmail = (email, name) => {
    //NOTE: send is async
    sgMail.send({
        to: email,
        from: 'rchayward99@gmail.com',
        subject: 'Sad to see you go.',
        text: `Hi ${name}. Why the hell are you cancelling?`
    })
}


module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}