import { createDownloadFormSchema,updateDownloadFormSchema } from 'src/form/download/saveDownloadFormSchema';
import {Download,DownloadFile} from 'src/db/models/download';
import errors from 'src/constants/errors';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import sequelize from 'src/db/index';

type ResponseData = {
	status: boolean;
	error?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
  if (req.method != "POST") res.status(403);

  const t = await sequelize.transaction();
  const mode = req.body.id  ? 'update' : 'create';
	const result = mode == 'update' ? updateDownloadFormSchema : createDownloadFormSchema
    .safeParse(req.body);

	let resStatus = false;
	let errorMessage = errors.POST_UNEXPECT;

	if (result) {
    let insertData = {};
    let files = req.body['files'];

		Object.keys(req.body).forEach((key) => {
      if(key != 'id')
        Object.assign(insertData, { [key]: req.body[key] });
    });

    try {
      if (mode == 'create') {

        const download = await Download.create({
          ...insertData},{
          include: [DownloadFile], transaction: t
        });
      }
      else {
        // delete download
        await Download.destroy({
          where: {
            id: req.body.id
          },
          transaction: t
        });
        await DownloadFile.destroy({
          where: {
            DownloadId: req.body.id
          },
          transaction: t
        });

        const result = await Download.create(insertData, {
          include: [DownloadFile],
          transaction: t
        });

      }

      await t.commit();

      resStatus = true;
    }
    catch (e) {
      await t.rollback();
      errorMessage = errors.POST_UNEXPECT;
    }
  }

	const resData: ResponseData = resStatus
		? {
				status: resStatus,
		  }
		: {
				status: resStatus,
				error: errorMessage,
		  };

	res.status(200).json(resData);
};
