// ** MUI Imports
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Router from 'next/router';
import Divider from '@mui/material/Divider';
import React from 'react';

import { render } from '@react-email/render';
import { SES } from '@aws-sdk/client-ses';
import AWS from 'aws-sdk';

// import { Email } from './email';

const RegisterTaxonSubmitPanel: React.VFC<{}> = () => {

	const seedRegisterTaxonMail = async () => {
		// let id = document.querySelector('input[name=id]')
		let id = (document.querySelector('input[name=id]') as HTMLInputElement).value;


		let email = document.querySelector('#register_taxon-email')?.innerHTML;
		email = email != undefined ? email : ''; 
		const response = document.querySelector('#reactRegisterTaxonForm .sun-editor-editable')?.innerHTML;

		let register_type = document.querySelector('#register_taxon-type')?.innerHTML;
		let bio_group = document.querySelector('#register_taxon-bio_group')?.innerHTML;

		let accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string
		let secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string
		var creds = new AWS.Credentials({
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,		  
		});

		const ses = new SES({ region: process.env.NEXT_PUBLIC_AWS_SES_REGION_NAME, credentials: creds})

		const params = {
		Source: 'no-reply@taicol.tw',
		Destination: {
			ToAddresses: [email],
		},
		Message: {
			Body: {
			Html: {
				Charset: 'UTF-8',
				Data: response,
			},
			},
			Subject: {
			Charset: 'UTF-8',
			Data: `[TaiCOL] 登錄物種—回應：${register_type} ${bio_group}`,
			},
		},
		};

		const sendPromise = ses.sendEmail(params).then(
			function(data) {
				alert('信件已寄出！')


				let values = {
					'response': response,
					'is_sent': 1,
					'id': id,
				}

				// console.log(values)

				const res = fetch('/api/admin/register_taxon/save', {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(values),
				}).then(function(){
					// console.log('done')
					location.reload();
					}
				);


		

			}).catch(
				function(err) {
				alert('寄送時發生錯誤！')
				console.error(err, err.stack);
			});;

	}
	

	return (
    <Grid item xs={12} marginTop={4} textAlign="right">
      <Divider sx={{marginY:4}} />
			<Button variant="contained" sx={{ marginRight: 3.5 }} onClick={() => { seedRegisterTaxonMail() }} >
				👉 寄送回覆
			</Button>
			<Button type="submit" variant="contained" sx={{ marginRight: 3.5 }}>
				Save
			</Button>
			<Button type="reset" variant="outlined" color="secondary" onClick={() =>Router.back()}>
				Cancel
			</Button>
		</Grid>
	);
};

export default RegisterTaxonSubmitPanel;
