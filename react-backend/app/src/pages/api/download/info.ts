import {Download} from 'src/db/models/download';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateDownloadFormSchema } from 'src/form/download/saveDownloadFormSchema';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const id = req.query.id;
	const result = updateDownloadFormSchema.pick({ id: true }).safeParse(id);

	let download: Download | null = null;

	if (result) {
		download = await Download.findByPk(id as string);
	}

	res.status(200).json(download);
};
