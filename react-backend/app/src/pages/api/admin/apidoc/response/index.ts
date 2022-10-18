import ApidocResponse from 'src/db/models/apidoc/ApidocResponse';
import type { NextApiRequest, NextApiResponse } from 'next/types';
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { page } = req.query;

  const pageNumber: number = page ? parseInt(page as string) : 1;
  const limit: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);
  const offset = pageNumber > 1 ? (pageNumber - 1) * limit : 0;

  const apidocResponse = await ApidocResponse.findAndCountAll({
    offset: offset,
		limit: limit,
	});

	res.status(200).json(apidocResponse);
};
