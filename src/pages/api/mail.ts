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
    }    // Create beautifully formatted HTML email content matching portfolio design
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>          body {
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: #ffffff;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #000000;
            font-weight: 400;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .container {
            background-color: #000000;
            border: 1px solid #27272a;
            border-radius: 8px;
            overflow: hidden;
            transition: border-color 0.3s ease;
          }
          .container:hover {
            border-color: #71717a;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid #27272a;
          }          .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 500;
            letter-spacing: 0.025em;
          }
          .content {
            padding: 30px;
            background-color: #000000;
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
            display: block;
            font-weight: 600;
            color: #e4e4e7;
            margin-bottom: 10px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }
          .value {
            font-size: 17px;
            color: #ffffff;
            word-wrap: break-word;
            font-weight: 400;
            line-height: 1.6;
          }          .message-content {
            background-color: #18181b;
            border: 1px solid #3f3f46;
            border-left: 4px solid #3b82f6;
            padding: 24px;
            border-radius: 8px;
            margin-top: 12px;
            white-space: pre-wrap;
            color: #ffffff;
            font-weight: 400;
            font-size: 16px;
            line-height: 1.7;
          }          .footer {
            background-color: #18181b;
            border-top: 1px solid #3f3f46;
            padding: 24px 30px;
            text-align: center;
            font-size: 14px;
            color: #d4d4d8;
            font-weight: 400;
          }
          .email-link {
            color: #3b82f6;
            text-decoration: none;
            transition: color 0.3s ease;
          }
          .email-link:hover {
            color: #8b5cf6;
            text-decoration: underline;
          }
          .phone-link {
            color: #3b82f6;
            text-decoration: none;
            transition: color 0.3s ease;
          }
          .phone-link:hover {
            color: #8b5cf6;
            text-decoration: underline;
          }          .timestamp {
            color: #a1a1aa;
            font-size: 13px;
            margin-top: 8px;
            font-weight: 400;
          }
          .footer-text {
            margin: 8px 0 0 0;
            color: #d4d4d8;
            font-weight: 400;
          }
          @media (max-width: 600px) {
            body {
              padding: 16px;
            }
            .header, .content {
              padding: 20px;
            }
            .container {
              border-radius: 6px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎮 New Portfolio Contact</h1>
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
                <a href="tel:${phone}" class="phone-link">${phone}</a>
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
          
          <div class="footer">            <div class="timestamp">
              📅 ${new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </div>
            <p class="footer-text">From Beer de Vreeze Portfolio</p>
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
