import type { NextApiRequest, NextApiResponse } from 'next';
import { ConfidentialClientApplication } from '@azure/msal-node';

const msalConfig = {
  auth: {
    clientId: process.env.MS_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}`,
    clientSecret: process.env.MS_CLIENT_SECRET!,
  },
};

const msalClient = new ConfidentialClientApplication(msalConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Name, email, subject, and message are required' });
  }

  try {
    const tokenResponse = await msalClient.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default'],
    });

    if (!tokenResponse?.accessToken) {
      throw new Error('Failed to obtain access token');
    }    // Create email content styled to match your portfolio site
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #ffffff;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #000000;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: antialiased;
          }          .container {
            background-color: #000000;
            border: 1px solid #27272a;
            border-radius: 8px;
            overflow: hidden;
          }          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 300;
            letter-spacing: 0.025em;
          }          .content {
            padding: 30px;
          }
          .field {
            margin-bottom: 24px;
            border-bottom: 1px solid #27272a;
            padding-bottom: 20px;
          }
          .field:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }          .label {
            display: inline-block;
            font-weight: 200;
            color: #ffffff;
            margin-bottom: 8px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .value {
            font-size: 16px;
            color: #ffffff;
            word-wrap: break-word;
            font-weight: 300;
          }.message-content {
            background-color: #111111;
            border: 1px solid #27272a;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 6px;
            margin-top: 12px;
            white-space: pre-wrap;
            font-weight: 300;
            color: #ffffff;
          }          .footer {
            background-color: #111111;
            border-top: 1px solid #27272a;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #ffffff;
          }
          .email-link {
            color: #3b82f6;
            text-decoration: none;
            transition: color 0.2s ease;
          }
          .email-link:hover {
            background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .gradient-text {
            background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            .header, .content {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 New Contact Form Submission</h1>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="label">👤 Name</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">📧 Email</div>
              <div class="value">
                <a href="mailto:${email}" class="email-link">${email}</a>
              </div>
            </div>
            
            ${phone ? `
            <div class="field">
              <div class="label">📱 Phone</div>
              <div class="value">
                <a href="tel:${phone}" class="email-link">${phone}</a>
              </div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">📝 Subject</div>
              <div class="value">${subject}</div>
            </div>
            
            <div class="field">
              <div class="label">💬 Message</div>
              <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>📅 Received on ${new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            })}</p>
            <p class="gradient-text">Sent from your portfolio contact form</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const graphResponse = await fetch('https://graph.microsoft.com/v1.0/users/' + process.env.MS_USER + '/sendMail', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenResponse.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: `Portfolio Contact: ${subject}`,
          body: {
            contentType: 'HTML',
            content: htmlContent,
          },
          toRecipients: [
            {
              emailAddress: {
                address: process.env.MS_USER,
              },
            },
          ],
          replyTo: [
            {
              emailAddress: {
                address: email,
                name: name,
              },
            },
          ],
        },
        saveToSentItems: true,
      }),
    });

    if (!graphResponse.ok) {
      const errorMessage = await graphResponse.text();
      const errorStatus = graphResponse.status;
      console.error(`Graph API Error: ${errorMessage} (Status Code: ${errorStatus})`);
      throw new Error(`Graph API Error: ${errorMessage} (Status Code: ${errorStatus})`);
    }

    return res.status(200).json({ 
      message: 'Email sent successfully via Microsoft Graph',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending email:', error);
    if (error instanceof Error) {
      return res.status(500).json({ 
        message: `Failed to send email: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({ 
      message: 'Failed to send email',
      timestamp: new Date().toISOString()
    });
  }
}
