import type { NextApiRequest, NextApiResponse } from 'next/types';
import { SES } from '@aws-sdk/client-ses';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'src/pages/api/auth/[...nextauth]'
import { Feedback } from 'src/db/models/feedback';
import errors from 'src/constants/errors';

type ResponseData = {
  status: boolean;
  error?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ status: false, error: 'Unauthorized' });
  }

  const { id, email, response } = req.body ?? {};

  if (!id || !email || !response) {
    return res.status(400).json({ status: false, error: 'Missing required fields' });
  }

  try {
    const ses = new SES({ region: process.env.AWS_SES_REGION_NAME });

    await ses.sendEmail({
      Source: 'no-reply@taicol.tw',
      Destination: { ToAddresses: [email] },
      Message: {
        Body: { Html: { Charset: 'UTF-8', Data: response } },
        Subject: { Charset: 'UTF-8', Data: '[TaiCOL] 意見回饋回覆' },
      },
    });

    await Feedback.update(
      { response, is_sent: 1 },
      { where: { id } },
    );

    return res.status(200).json({ status: true });
  } catch (err) {
    console.error('Feedback send error:', err);
    return res.status(500).json({ status: false, error: errors.POST_UNEXPECT });
  }
};