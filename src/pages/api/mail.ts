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

  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const tokenResponse = await msalClient.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default'],
    });

    if (!tokenResponse?.accessToken) {
      throw new Error('Failed to obtain access token');
    }

    const graphResponse = await fetch('https://graph.microsoft.com/v1.0/users/' + process.env.MS_USER + '/sendMail', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenResponse.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: `New Message from ${name}: ${subject}`,
          body: {
            contentType: 'HTML',
            content: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>New Message from ${name}</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>
            `,
          },
          toRecipients: [
            {
              emailAddress: {
                address: process.env.MS_USER,
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

    return res.status(200).json({ message: 'Email sent successfully via Microsoft Graph' });
  } catch (error) {
    console.error('Error sending email:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: `Failed to send email: ${error.message}` });
    }
    return res.status(500).json({ message: 'Failed to send email' });
  }
}
