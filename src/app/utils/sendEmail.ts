import nodemailer from 'nodemailer';
import config from '../config'; // Make sure this imports your config settings
import twilio from 'twilio';
import { Twilio } from 'twilio';
export const sendEmail = async (
  to: string | string[],
  html: string,
  subject: string,
  attachment?: string | string[], // Added attachment parameter
) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // You may change this if using a different email provider
    port: 587,
    secure: config.NODE_ENV === 'production',
    auth: {
      user: process.env.MAIL_FROM,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_FROM, // Replace with your email
    to, // Receiver(s) - can be a single email or an array
    subject, // Email subject
    text: '', // You can also add plain text if needed
    html, // The HTML content of the email
    attachments: attachment
      ? [{ path: Array.isArray(attachment) ? attachment[0] : attachment }]
      : [], // Ensure path is a string // Attachments if provided
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    return;
  }
};

// export const sendSMS = async (
//   to: string | string[],
//   body: string,
// ) => {
//   const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

//   const messageOptions = {
//     from: process.env.TWILIO_PHONE_NUMBER, // Replace with your Twilio phone number
//     to, // Receiver(s) - can be a single phone number or an array
//     body, // The body of the SMS
//   };

//   await client.messages.create(messageOptions);
// };

// Twilio credentials from environment variables or directly replace the values here.
const accountSid: string =
  process.env.TWILIO_ACCOUNT_SID || 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const authToken: string = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
const fromPhoneNumber: string =
  process.env.TWILIO_PHONE_NUMBER || '+16312848571'; // Replace with your Twilio phone number

// Initialize Twilio client
const client = new Twilio(accountSid, authToken);

/**
 * Sends an OTP message using Twilio.
 * @param to - The recipient's phone number in E.164 format (e.g., +1234567890)
 * @param otp - The OTP message to send
 * @returns Promise<string> - The SID of the sent message
 */

import http from 'http';

import https from 'https';

export const sendOtp = async (phone: string, otp: string): Promise<string> => {
  const apiKey = process.env.SMS_API_KEY; // Ensure you have your API key in the environment variables
  const cleanPhone = phone.replace(/\D/g, '').replace(/^91/, ''); // Clean the phone number
  const url = `https://sms.renflair.in/V1.php?API=${apiKey}&PHONE=${cleanPhone}&OTP=${otp}`;

  const response = await new Promise<string>((resolve, reject) => {
    https
      .get(url, response => {
        let data = '';

        response.on('data', chunk => {
          data += chunk;
        });

        response.on('end', () => {
          console.log('OTP sent successfully:', data);
          resolve(data); // Return the response data or SID if needed
        });
      })
      .on('error', error => {
        console.error('Error sending OTP:', error);
        reject(new Error('Could not send OTP. Please try again.'));
      });
  });

  return response; // Return the complete response
};

export const sendSMS = async (to: string, msg: string): Promise<string> => {
  try {
    const message = await client.messages.create({
      body: `${msg}`,
      to,
      from: fromPhoneNumber,
    });

    console.log(`OTP sent successfully: ${message.sid}`);
    return message.sid;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return '';
    // throw new Error('Could not send OTP. Please try again.');
  }
};

// export const sendSMS = async (to: string, msg: string): Promise<string> => {
//   try {
//     // Remove any non-numeric characters and leading '+91' from phone number
//     const cleanPhone = to.replace(/\D/g, '').replace(/^91/, '');

//     // Construct the SMS API URL
//     const apiUrl = `https://sms.renflair.in/V1.php?API=${process.env.SMS_API_KEY}&PHONE=${cleanPhone}&OTP=${msg}`;

//     console.log('apiUrl', apiUrl);
//     // Make GET request to SMS API
//     const response = await fetch(apiUrl);

//     if (!response.ok) {
//       throw new Error('SMS API request failed');
//     }

//     console.log('SMS sent successfully');
//     return 'success';
//   } catch (error) {
//     console.error('Failed to send SMS:', error);
//     return '';
//   }
// };

export const emailContentForAdmin = ({
  patientName,
  patientPhone,
  secureUrl,
  ADMIN_PHONE,
}: {
  patientName: string;
  patientAddress: string;
  patientPhone: string;
  secureUrl: string;
  ADMIN_PHONE: string;
}): string => `
<div style="font-family: Arial, sans-serif; color: #333;">
  <h2 style="color: #4CAF50;">🎉 New Appointment Created!</h2>
  <p>We are excited to inform you that a new appointment has been scheduled for <strong>${patientName}</strong>.</p>
  <p><strong>Appointment Details:</strong></p>
  <ul style="list-style-type: none; padding: 0;">
    <li><strong>Patient:</strong> ${patientName}</li>
    <li><strong>Test:</strong> We will notify you!</li>
    <li><strong>Patient Contact:</strong> ${patientPhone}</li>
  </ul>
  ${secureUrl ? `<img src="${secureUrl}" alt="Prescription Photo" style="max-width: 100%; height: auto;"/>` : ''}
    ${secureUrl ? `<a href="${secureUrl}" download style="display: inline-block; margin-top: 10px; padding: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Download Prescription Photo</a>` : ''}
  <p>Please take a moment to review the Prescription details and confirm with the patient at your earliest convenience.</p>
  <p style="font-weight: bold;">Thank you for your attention!</p>
  <p>Best Regards,</p>
  <p style="font-style: italic;">The ${ADMIN_PHONE} Team</p>
 
</div>
`;

export const smsClient = ({
  patientName,
  patientAddress,
  testName,
  mrp,
  ADMIN_PHONE,
}: {
  patientName: string;
  patientAddress: string;
  testName: string;
  mrp: string;
  ADMIN_PHONE: string;
}): string => `Appointment Confirmation!! \n Thank you for booking. Our team will reach out to you shortly for choosing your suitable date and time using the details you provided.\n
appointment with ${process.env.APP_NAME}\n
Name: ${patientName}\n
Location: ${patientAddress}\n
Test: ${testName}\n
Amount: ${mrp}\n
Booking Type: ${testName}\n
We are thrilled to have you as our customer.\n
Get ready for a great experience.\n
If you have any further queries or need to cancel your order, please feel free to contact us at this number: ${ADMIN_PHONE}`;

export const emailAndSmsForDigonastic = ({
  name,
  address,
  amount,
  bookingType,
  adminPhone,
}: {
  name: string;
  address: string;
  amount: string;
  bookingType: string;
  adminPhone: string;
}): string => `
Appointment confirmation!!\n
Thank you for booking your diagnosis\n
Our team will reach out to you shortly f choosing your suitable date and time using the details you provided. appointment with OpenLabBookMobile.\n
NAME-${name}
LOCATION-${address}
TESTS-AMOUNT-${amount}
Booking Type- ${bookingType}
We're thrilled to have you as our customer.
Get ready for a great experience.
If you have any further inquiries, or cancel your order please feel free to contact us in this no. -${adminPhone}.
`;
export const HtmltemplateForService = ({
  user,
  organization,
  patientName,
  test,
  amount,
  bookingType,
  referBy,
  address,
}: {
  user: string;
  organization: string;
  patientName: string;
  test: string;
  amount: string;
  bookingType: string | undefined;
  referBy: string;
  address: string;
}): string => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #e0e0e0;">
  <div style="text-align: center; padding: 20px 0;">
    <h1 style="color: #4CAF50; margin: 0;">Appointment Confirmation</h1>
  </div>

  <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; color: #333;">Dear <strong>${user}</strong>,</p>
    
    <p style="font-size: 16px; color: #333;">We are pleased to confirm your appointment at <strong>${organization}</strong>.</p>

    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h2 style="color: #4CAF50; font-size: 18px; margin-top: 0;">Appointment Details</h2>
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li style="padding: 8px 0;"><strong>Patient:</strong> ${patientName}</li>
        <li style="padding: 8px 0;"><strong>Diagnostic Centre:</strong> ${organization}</li>
        <li style="padding: 8px 0;"><strong>Tests:</strong> ${test}</li>
          <li style="padding: 8px 0;"><strong>Address:</strong> ${address}</li>
        <li style="padding: 8px 0;"><strong>Amount:</strong> ${amount}</li>
        <li style="padding: 8px 0;"><strong>Booking Type:</strong> ${bookingType}</li>
          <li style="padding: 8px 0;"><strong>Reffered By:</strong> ${referBy}</li>
      </ul>
    </div>

    <p style="font-size: 16px; color: #333; background-color: #e8f5e9; padding: 15px; border-radius: 5px;">
      Our team will reach out to you shortly for choosing your suitable date and time using the details you provided.
    </p>

    <p style="font-size: 16px; color: #666; margin-top: 20px;">
      For any further inquiries, please don't hesitate to contact us.
    </p>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #666;">Best regards,</p>
      <p style="margin: 5px 0; color: #4CAF50; font-weight: bold;">The OpenLabBookMobile Team 😊</p>
    </div>
  </div>
</div>`;

export const HtmltemplateForAdmin = ({
  user,
  organization,
  patientName,
  test,
  amount,
  bookingType,
  referBy,
  contactNumber,
  address,
}: {
  user: string;
  organization: string;
  patientName: string;
  test: string;
  amount: string;
  bookingType: string;
  referBy: string;
  contactNumber: string;
  address: string;
}): string => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #e0e0e0;">
  <div style="text-align: center; padding: 20px 0;">
    <h1 style="color: #4CAF50; margin: 0;">New Appointment Notification</h1>
  </div>

  <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; color: #333;">Dear Admin,</p>
    
    <p style="font-size: 16px; color: #333;">A new appointment has been scheduled at <strong>${organization}</strong>.</p>

    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h2 style="color: #4CAF50; font-size: 18px; margin-top: 0;">Appointment Details</h2>
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li style="padding: 8px 0;"><strong>Patient Name:</strong> ${patientName}</li>
        <li style="padding: 8px 0;"><strong>Contact Number:</strong> ${contactNumber}</li>
        <li style="padding: 8px 0;"><strong>Diagnostic Centre:</strong> ${organization}</li>
        <li style="padding: 8px 0;"><strong>Tests:</strong> ${test}</li>
            <li style="padding: 8px 0;"><strong>Address:</strong> ${address}</li>
        <li style="padding: 8px 0;"><strong>Amount:</strong> ${amount}</li>
        <li style="padding: 8px 0;"><strong>Booking Type:</strong> ${bookingType}</li>
         <li style="padding: 8px 0;"><strong>Reffered By:</strong> ${referBy}</li>
      </ul>
    </div>

    <p style="font-size: 16px; color: #333; background-color: #e8f5e9; padding: 15px; border-radius: 5px;">
      Please review the appointment details and contact the patient to confirm their preferred date and time.
    </p>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #666;">Best regards,</p>
      <p style="margin: 5px 0; color: #4CAF50; font-weight: bold;">The OpenLabBookMobile Team 😊</p>
    </div>
  </div>
</div>`;

export const smsFormatBookAppointmentClient = ({
  name,
  test,
  amount,
  location,
  bookingType,
  referredBy,
}: {
  name: string;
  test: string;
  amount: string;
  location?: string;
  bookingType: string;
  referredBy?: string;
}) =>
  `Appointment Confirmed!
Thank you for booking. Our team will contact you soon to finalize the date and time.
Name: ${name}
Test: ${test}
Amount: ₹${amount}
Location: ${location || 'No Address Provided'}
Type: ${bookingType}
Referred By: ${referredBy}
For queries or cancellations, contact: ${process.env.ADMIN_PHONE}
`;

export const smsFormatBookAppointmentAdmin = ({
  name,
  organizationName,
  test,
  amount,
  contactNumber,
  serviceName,
  referredBy,
}: {
  name: string;
  organizationName: string;
  test: string;
  amount: string;
  contactNumber: string;
  serviceName: string | any;
  referredBy: string | any;
}) =>
  `${name}, ${organizationName}, ${test}, ₹${amount}, ${contactNumber}, ${serviceName}, Referred By: ${referredBy}`;

export const smsFormatHomeCareClient = ({
  name,
  test,
  amount,
  address,
}: {
  name: string;
  test: string;
  amount: string;
  address?: string;
}) => `Home Care Service Confirmation: Thank you for booking with OpenLabBookMobile! Our team will contact you soon to finalize the date and time.
Name: ${name} Tests: ${test}
Amount: ₹${amount} 
Address: ${address || 'No Address Provided'} 
Booking Type: Home Care Health Service We’ll contact you `;

export const smsFormatHomeCareAdmin = ({
  name,
  organizationName,
  test,
  amount,
  contact,
  address,
}: {
  name: string;
  organizationName: string | any;
  test: string;
  amount: string;
  contact: string;
  address: string;
}) => `Home Care Health Service booked
PATIENT- ${name}
DIAGNOSTIC CENTER- ${organizationName}
TESTS- ${test}
AMOUNT- ₹${amount}
CONTACT- ${contact}
ADDRESS- ${address || 'No Address Provided'}.`;

export const smsFormatCancelClient = ({
  name,
  contactNumber,
  appLink,
}: {
  name: string;
  contactNumber: string;
  appLink: string;
}) =>
  `Appointment Cancellation: Dear ${name}, your appointment is canceled. Apologies for the inconvenience. To reschedule, contact ${contactNumber} or visit ${appLink}. Thank you, Team OpenLabBookMobile.`;

export const smsFormatCancelAdmin = ({
  patientName,
  diagnosticCenter,
  tests,
  amount,
  contact,
  service,
}: {
  patientName: string;
  diagnosticCenter: string;
  tests: string;
  amount: string;
  contact: string;
  service: string;
}) =>
  `Order Cancellation: Patient: ${patientName}, Center: ${diagnosticCenter}, Tests: ${tests}, Amount: ₹${amount}, Contact: ${contact}, Service: ${service}. Please contact the customer.`;

export const sendWhatsApp = async (template: any): Promise<string> => {
  const apiKey = process.env.WHATSAPP_API_KEY; // Ensure you have your API key in the environment variables
  console.log('template', template);
  const url =
    'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/';

  try {
    const response = await new Promise<string>((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: `${apiKey}`, // Assuming the API requires a Bearer token
        },
      };

      const request = https.request(url, options, response => {
        let data = '';

        response.on('data', chunk => {
          data += chunk;
        });

        response.on('end', () => {
          console.log('WhatsApp message sent successfully:', data);
          resolve(data); // Return the response data or SID if needed
        });
      });

      request.on('error', error => {
        console.error('Error sending WhatsApp message:', error);
        reject(new Error('Could not send WhatsApp message. Please try again.'));
      });

      request.write(JSON.stringify(template)); // Assuming 'template' is the payload to send
      request.end();
    });

    return response; // Return the complete response
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw new Error('Could not send WhatsApp message. Please try again.');
  }
};

export const WA_DirectBookingSendClient = ({
  to,
  message,
}: {
  to: [string];
  message: string;
}) => {
  return {
    integrated_number: '919064090674',
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: 'clientprescription_confirmation',
        language: {
          code: 'en',
          policy: 'deterministic',
        },
        namespace: 'c1638e88_aae5_4b32_801b_af9d8a8370c0',
        to_and_components: [
          {
            to: to,
            components: {
              body_1: {
                type: 'text',
                value: message,
              },
            },
          },
        ],
      },
    },
  };
};

export const WA_DirectBookingSendAdmin = ({
  to,
  name,
  patientnumber,
  patientAge,
}: {
  to: [string];
  name: string;
  patientnumber: string;
  patientAge: string;
}) => {
  return {
    integrated_number: '919064090674',
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: 'w_prescriptionbooking_admin',
        language: {
          code: 'en',
          policy: 'deterministic',
        },
        namespace: 'c1638e88_aae5_4b32_801b_af9d8a8370c0',
        to_and_components: [
          {
            to: to,
            components: {
              body_1: {
                type: 'text',
                value: name,
              },
              body_2: {
                type: 'text',
                value: patientnumber,
              },
              body_3: {
                type: 'text',
                value: patientAge,
              },
            },
          },
        ],
      },
    },
  };
};

export const WA_AppoinmentAdmin = ({
  to,
  patientName,
  patientAge,
  patientSex,
  referredBy,
  tests,
  patientContact,
  amount,
  diagnosticCenterName,
}: {
  to: string;
  patientName: string;
  patientAge: string;
  patientSex: string;
  referredBy: string;
  tests: string;
  patientContact: string;
  amount: string;
  diagnosticCenterName: string;
}) => {
  return {
    integrated_number: '919064090674',
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: 'appointment_confirmation_admin',
        language: {
          code: 'en',
          policy: 'deterministic',
        },
        namespace: 'c1638e88_aae5_4b32_801b_af9d8a8370c0',
        to_and_components: [
          {
            to: [to],
            components: {
              body_1: {
                type: 'text',
                value: patientName,
              },
              body_2: {
                type: 'text',
                value: patientAge,
              },
              body_3: {
                type: 'text',
                value: patientSex,
              },
              body_4: {
                type: 'text',
                value: referredBy,
              },
              body_5: {
                type: 'text',
                value: tests,
              },
              body_6: {
                type: 'text',
                value: patientContact,
              },
              body_7: {
                type: 'text',
                value: amount,
              },
              body_8: {
                type: 'text',
                value: diagnosticCenterName,
              },
            },
          },
        ],
      },
    },
  };
};

export const WA_AppoinmentClient = ({
  to,
  patientName,
  patientAge,
  patientSex,
  referredBy,
  tests,
  patientContact,
  amount,
  diagnosticCenterName,
}: {
  to: string;
  patientName: string;
  patientAge: string;
  patientSex: string;
  referredBy: string;
  tests: string;
  patientContact: string;
  amount: string;
  diagnosticCenterName: string;
}) => {
  return {
    integrated_number: '919064090674',
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: 'appointment_confirmation_client',
        language: {
          code: 'en',
          policy: 'deterministic',
        },
        namespace: 'c1638e88_aae5_4b32_801b_af9d8a8370c0',
        to_and_components: [
          {
            to: [to],
            components: {
              body_1: {
                type: 'text',
                value: patientName,
              },
              body_2: {
                type: 'text',
                value: patientAge,
              },
              body_3: {
                type: 'text',
                value: patientSex,
              },
              body_4: {
                type: 'text',
                value: tests,
              },
              body_5: {
                type: 'text',
                value: amount,
              },
              body_6: {
                type: 'text',
                value: diagnosticCenterName,
              },
              body_7: {
                type: 'text',
                value: referredBy,
              },
            },
          },
        ],
      },
    },
  };
};

export const WA_HomecareClient = ({
  to,
  patientName,
  patientAge,
  patientSex,
  tests,
  amount,
  patientAddress,
  referredBy,
  diagnosticCenterName,
}: {
  to: string;
  patientName: string;
  patientAge: string;
  patientSex: string;
  tests: string;
  amount: string;
  patientAddress: string;
  referredBy: string;
  diagnosticCenterName: string;
}) => {
  return {
    integrated_number: '919064090674',
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: 'homecare_client',
        language: {
          code: 'en',
          policy: 'deterministic',
        },
        namespace: 'c1638e88_aae5_4b32_801b_af9d8a8370c0',
        to_and_components: [
          {
            to: [to],
            components: {
              body_1: {
                type: 'text',
                value: patientName,
              },
              body_2: {
                type: 'text',
                value: patientAge,
              },
              body_3: {
                type: 'text',
                value: patientSex,
              },
              body_4: {
                type: 'text',
                value: tests,
              },
              body_5: {
                type: 'text',
                value: amount,
              },
              body_6: {
                type: 'text',
                value: patientAddress,
              },
              body_7: {
                type: 'text',
                value: referredBy,
              },
              body_8: {
                type: 'text',
                value: diagnosticCenterName,
              },
            },
          },
        ],
      },
    },
  };
};

export const WA_HomeCareAdmin = ({
  to,
  patientName,
  patientAge,
  patientSex,
  tests,
  amount,
  patientAddress,
  referredBy,
  diagnosticCenterName,
  patientContact,
}: {
  to: string;
  patientName: string;
  patientAge: string;
  patientSex: string;
  tests: string;
  amount: string;
  patientAddress: string;
  referredBy: string;
  diagnosticCenterName: string;
  patientContact: string;
}) => {
  return {
    integrated_number: '919064090674',
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: 'home_care_admin',
        language: {
          code: 'en',
          policy: 'deterministic',
        },
        namespace: 'c1638e88_aae5_4b32_801b_af9d8a8370c0',
        to_and_components: [
          {
            to: [to],
            components: {
              body_1: {
                type: 'text',
                value: patientName,
              },
              body_2: {
                type: 'text',
                value: patientAge,
              },
              body_3: {
                type: 'text',
                value: patientSex,
              },
              body_4: {
                type: 'text',
                value: referredBy,
              },
              body_5: {
                type: 'text',
                value: diagnosticCenterName,
              },
              body_6: {
                type: 'text',
                value: tests,
              },
              body_7: {
                type: 'text',
                value: amount,
              },
              body_8: {
                type: 'text',
                value: patientContact,
              },
              body_9: {
                type: 'text',
                value: patientAddress,
              },
            },
          },
        ],
      },
    },
  };
};
