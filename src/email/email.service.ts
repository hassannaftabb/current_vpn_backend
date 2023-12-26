import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import axios from 'axios';
import {
  generatePasswordResetConfirmation,
  generateResetPasswordOtpEmailTemplate,
} from './templates/otpEmailTemplate';
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: 'support@currentvpn.io',
        pass: process.env.BREVO_SMTP_KEY,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    name?: string,
  ): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Current VPN" ${process.env.SUBTITLEO_SUPPORT_EMAIL}`,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    this.transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error('Failed to send email:', error);
      } else {
        console.log(name, name.split(' ')[0], name.split(' ')[1]);
        await axios
          .post(
            'https://api.brevo.com/v3/contacts',
            {
              email: to,
              listIds: [2],
              updateEnabled: false,
              attributes: {
                FIRSTNAME: name.split(' ')[0],
                LASTNAME: name.split(' ')[1],
              },
            },
            {
              headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
              },
            },
          )
          .then((response) => {
            console.log(response.data);
            console.log('Email sent successfully:', info.response);
          })
          .catch((error) => {
            console.log('Coudnt cra=eate contact', error);
          });
      }
    });
  }

  async sendResetPasswordOtpEmail(
    to: string,
    name: string,
    otp: number,
  ): Promise<void> {
    const subject = 'Reset Password OTP Confirmation';
    const text = `Welcome to Subtitleo, ${name}! Here is your OTP to reset your password: ${otp}. It'll expire in 10 minutes. Happy subtitling! Best regards, The Subtitleo Team`;
    const html = generateResetPasswordOtpEmailTemplate(name, otp);
    await this.sendEmail(to, subject, text, html, name);
  }
  async sendPasswordResetConfirmationEmail(
    to: string,
    name: string,
  ): Promise<void> {
    const subject = 'Password reset successfull!';
    const text = `Your password have been resetted successfully!`;
    const html = generatePasswordResetConfirmation(name);
    await this.sendEmail(to, subject, text, html, name);
  }
}
