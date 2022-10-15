import ApidocResponse from 'src/db/models/apidoc/ApidocResponse';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { updateApidocResponseFormSchema } from 'src/form/apidoc/saveApidocFormSchema';

export default async (req: NextApiRequest, res: NextApiResponse) => {

	const id = req.query.id;
	const result = updateApidocResponseFormSchema.pick({ id: true }).safeParse(id);

	let apidocResponse: ApidocResponse | null = null;

	if (result) {
		apidocResponse = await ApidocResponse.findByPk(id as string);
	}

	res.status(200).json(apidocResponse);
};
