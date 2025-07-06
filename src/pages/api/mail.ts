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
        <style>
          body {
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: #ffffff;
            max-width: 640px;
            margin: 0 auto;
            padding: 24px;
            background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%);
            font-weight: 300;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            letter-spacing: 0.025em;
          }
          
          .email-wrapper {
            background: radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
                       radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.03) 0%, transparent 50%);
            padding: 20px;
            border-radius: 16px;
          }
          
          .container {
            background: linear-gradient(to bottom right, #111111 0%, #000000 50%, #111111 100%);
            border: 1px solid #1f2937;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8),
                       0 0 0 1px rgba(255, 255, 255, 0.02);
            position: relative;
          }
          
          .container::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                       linear-gradient(to bottom, rgba(139, 92, 246, 0.05) 1px, transparent 1px);
            background-size: 20px 20px;
            opacity: 0.3;
            pointer-events: none;
            border-radius: 12px;
          }
          
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #6366f1 25%, #8b5cf6 50%, #ec4899 75%, #3b82f6 100%);
            color: white;
            padding: 36px 32px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
            animation: shimmer 3s ease-in-out infinite;
          }
          
          @keyframes shimmer {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
          }
          
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
            letter-spacing: 0.05em;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          .content {
            padding: 36px 32px;
            background: linear-gradient(to bottom, #000000 0%, #0a0a0a 100%);
            position: relative;
          }
          
          .field {
            margin-bottom: 28px;
            border-bottom: 1px solid #1f2937;
            padding-bottom: 24px;
            position: relative;
          }
          
          .field:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          
          .field::before {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 0;
            height: 1px;
            background: linear-gradient(to right, #3b82f6, #8b5cf6);
            transition: width 0.3s ease;
          }
          
          .label {
            display: block;
            font-weight: 300;
            color: #d1d5db;
            margin-bottom: 12px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            opacity: 0.9;
          }
          
          .value {
            font-size: 18px;
            color: #ffffff;
            word-wrap: break-word;
            font-weight: 300;
            line-height: 1.6;
            letter-spacing: 0.025em;
          }
          
          .message-content {
            background: linear-gradient(135deg, #0f1419 0%, #1a1a1a 100%);
            border: 1px solid #374151;
            border-left: 3px solid;
            border-left-color: #3b82f6;
            padding: 28px;
            border-radius: 12px;
            margin-top: 16px;
            white-space: pre-wrap;
            color: #ffffff;
            font-weight: 300;
            font-size: 16px;
            line-height: 1.7;
            letter-spacing: 0.025em;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
            position: relative;
          }
          
          .message-content::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background: linear-gradient(45deg, rgba(59, 130, 246, 0.02) 1px, transparent 1px),
                       linear-gradient(-45deg, rgba(139, 92, 246, 0.02) 1px, transparent 1px);
            background-size: 15px 15px;
            border-radius: 12px;
            pointer-events: none;
          }
          
          .footer {
            background: linear-gradient(to bottom, #0a0a0a 0%, #000000 100%);
            border-top: 1px solid #1f2937;
            padding: 28px 32px;
            text-align: center;
            font-size: 14px;
            color: #9ca3af;
            font-weight: 300;
            position: relative;
          }
          
          .email-link, .phone-link {
            color: #3b82f6;
            text-decoration: none;
            transition: all 0.3s ease;
            font-weight: 400;
          }
          
          .email-link:hover, .phone-link:hover {
            color: #8b5cf6;
            text-decoration: underline;
            text-decoration-color: rgba(139, 92, 246, 0.5);
          }
          
          .timestamp {
            color: #6b7280;
            font-size: 12px;
            margin-top: 12px;
            font-weight: 300;
            letter-spacing: 0.05em;
          }
          
          .footer-text {
            margin: 12px 0 0 0;
            color: #9ca3af;
            font-weight: 300;
            letter-spacing: 0.025em;
          }
          
          .icon {
            display: inline-block;
            margin-right: 8px;
            font-size: 14px;
            opacity: 0.8;
          }
          
          @media (max-width: 640px) {
            body {
              padding: 16px;
            }
            .email-wrapper {
              padding: 12px;
            }
            .header, .content, .footer {
              padding-left: 24px;
              padding-right: 24px;
            }
            .header {
              padding-top: 28px;
              padding-bottom: 28px;
            }
            .content {
              padding-top: 28px;
              padding-bottom: 28px;
            }
            .container {
              border-radius: 8px;
            }
            .header h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <h1>🎮 New Portfolio Contact</h1>
            </div>
            
            <div class="content">
              <div class="field">
                <div class="label"><span class="icon">👤</span>Name</div>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <div class="label"><span class="icon">📧</span>Email</div>
                <div class="value">
                  <a href="mailto:${email}" class="email-link">${email}</a>
                </div>
              </div>
              
              ${phone ? `
              <div class="field">
                <div class="label"><span class="icon">📱</span>Phone</div>
                <div class="value">
                  <a href="tel:${phone}" class="phone-link">${phone}</a>
                </div>
              </div>
              ` : ''}
              
              <div class="field">
                <div class="label"><span class="icon">📝</span>Subject</div>
                <div class="value">${subject}</div>
              </div>
              
              <div class="field">
                <div class="label"><span class="icon">💬</span>Message</div>
                <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            
            <div class="footer">
              <div class="timestamp">
                <span class="icon">📅</span>${new Date().toLocaleDateString('en-US', {
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
