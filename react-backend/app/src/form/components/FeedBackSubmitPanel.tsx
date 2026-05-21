// ** MUI Imports
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Router from 'next/router';
import Divider from '@mui/material/Divider';
import React from 'react';


const FeedBackSubmitPanel: React.VFC<{}> = () => {

	const seedFeedbackMail = async () => {
	const id = (document.querySelector('input[name=id]') as HTMLInputElement).value;
	let email = document.querySelector('#feedback-email')?.innerHTML;
	email = email != undefined ? email : '';
	const response = document.querySelector('#reactFeedbackForm .sun-editor-editable')?.innerHTML;

	try {
		const res = await fetch('/api/admin/feedback/send', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ id, email, response }),
		});
		const data = await res.json();

		if (data.status) {
		alert('信件已寄出！');
		location.reload();
		} else {
		alert('寄送時發生錯誤！');
		console.error(data.error);
		}
	} catch (err) {
		alert('寄送時發生錯誤！');
		console.error(err);
	}
	};

	return (
    <Grid item xs={12} marginTop={4} textAlign="right">
      <Divider sx={{marginY:4}} />
			<Button variant="contained" sx={{ marginRight: 3.5 }} onClick={() => { seedFeedbackMail() }} >
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

export default FeedBackSubmitPanel;
