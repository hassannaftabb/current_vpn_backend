export const generateResetPasswordOtpEmailTemplate = (
  name: string,
  otp?: number,
) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            padding: 20px;
          }
  
          .container {
            background-color: #ffffff;
            border-radius: 5px;
            padding: 20px;
          }
  
          h1 {
            color: #333;
          }
  
          p {
            color: #666;
          }
  
          .cta {
            display: inline-block;
            color: #fff;
            background-color: #1e88e5;
            padding: 10px 20px;
            margin-top: 20px;
            margin-bottom: 20px;
            text-decoration: none;
            border-radius: 3px;
            transition: background-color 0.2s;
          }
  
          .cta:hover {
            background-color: #1976d2;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hello ${name},</h1>
          <p>Here is your OTP for resetting password. It'll expire in 10 minutes.</p>
          <h2>${otp}</h2        
        </div>
      </body>
      </html>
    `;
};
export const generatePasswordResetConfirmation = (name: string) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            padding: 20px;
          }
  
          .container {
            background-color: #ffffff;
            border-radius: 5px;
            padding: 20px;
          }
  
          h1 {
            color: #333;
          }
  
          p {
            color: #666;
          }
  
          .cta {
            display: inline-block;
            color: #fff;
            background-color: #1e88e5;
            padding: 10px 20px;
            margin-top: 20px;
            margin-bottom: 20px;
            text-decoration: none;
            border-radius: 3px;
            transition: background-color 0.2s;
          }
  
          .cta:hover {
            background-color: #1976d2;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Congratulations, ${name},</h1>
          <p>Your password have been resetted successfully, now you can enjoy subtitling!</p>
        </div>
      </body>
      </html>
    `;
};
