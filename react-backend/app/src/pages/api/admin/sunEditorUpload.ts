import type { NextApiRequest, NextApiResponse } from 'next/types';
import { promises as fs } from "fs";
import path from "path";
import formidable, { File } from 'formidable';
import { nanoid } from 'nanoid'

/* Don't miss that! */
export const config = {
    api: {
        bodyParser: false,
    }
};

type ProcessedFiles = Array<[string, File]>;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  let status = 200;
  let uploadStatus = 'fail';
  let fileURL = '';
  let filename = '';
  let fileSize = 0;
  const fileUrls = []

  /* Get files using formidable */
  const files = await new Promise<ProcessedFiles | undefined>((resolve, reject) => {
      const form = new formidable.IncomingForm();
      const files: ProcessedFiles = [];
      form.on('file', function (field, file) {
          files.push([field, file]);
      })
      form.on('end', () => resolve(files));
      form.on('error', err => reject(err));
      form.parse(req, () => {
          //
      });
  }).catch(e => {
      console.log(e);
      status = 500;
      uploadStatus = 'false';
  });

  if (files?.length) {

    /* Create directory for uploads */
    const uploadPath = `/public/upload/`

    const targetPath = path.join(process.cwd(), uploadPath);
      try {
          await fs.access(targetPath);
      } catch (e) {
          await fs.mkdir(targetPath);
      }

      /* Move uploaded files to directory */
      for (const file of files) {
        const tempPath = file[1].filepath;
        const ext = file[1]?.originalFilename?.split('.').pop() || '';
        //const filename = `${nanoid()}.${ext}`;
        filename = file[1]?.originalFilename || '';
        fileSize = file[1]?.size || 0;
        await fs.copyFile(tempPath, targetPath +filename);
        fileURL = `${process.env.NEXT_PUBLIC_DOMAIN}/upload/${filename}`
        fileUrls.push(fileURL)
        uploadStatus = 'ok';
      }
  }

  if (!uploadStatus) {
    res
      .status(422)
      .json({ error: "Only .png, .jpeg or .jpg are allowed." });
  }
  else {

  }
  res.status(200).json({
      result: [
        {
          url: fileURL,
          name: filename,
          size: fileSize,
        },
      ],
    })
}

export default handler;
