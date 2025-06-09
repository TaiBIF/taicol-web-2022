import React from 'react';

export type ActionTypes = 'info' | 'update' | 'delete';
export type TableRows = UserData[] | CategoryDataProps[] | NewsDataProps[] | ArticleDataProps[] | ApiResponseDataProps[] | DownloadDataProps[] | ExpertDataProps[] | FeedbackDataProps[] | RegisterTaxonDataProps[];;
import {CategoryTypes} from 'src/types'

export type UserData = {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	phone: string;
	role: string;
	name: string;
};

export type CategoryDataProps = {
	id: number;
	type: CategoryTypes;
	name: string;
	name_eng: string;
	sort: number;
};

export type NewsDataProps = {
	id: number;
	title: string;
	publishedDate: string;
	description: string;
	category: string;
	Category: {
		name: string;
		name_eng: string;
	}
};

export type ArticleDataProps = {
	id: number;
	title: string;
	description: string;
	publishedDate: string;
	author: string;
	category: string;
	Category: {
		name: string;
		name_eng: string;
	}
};

export type DownloadFileDataProps = {
	url: string,
	type: string,
}

export type DownloadDataProps = {
	id: number;
	title: string;
	title_eng: string;
	description: string;
	description_eng: string;
	publishedDate: string;
	files: string | React.ReactNode;
	category: string;
	Category: {
		name: string;
		name_eng: string;
	},
	DownloadFiles: DownloadFileDataProps[]
};

export type ApiResponseDataProps = {
	id: number;
	title: string;
	content: string;
};

export type ExpertDataProps = {
	id: number;
    name: string;
    name_e:  string;
    email: string;
    taxon_group: number;
	updatedAt: string;
	createdAt: string;
};

export type FeedbackDataProps = {
	id: number;
	feedback_type: number;
	title: string;
	description: string; 
	reference: string; 
	notify: boolean; 
	name: string;
	email: string;
	response: string;
	taxon_id: string;
	is_solved: string;
	is_sent: string;
	createdAt: string;
	updatedAt: string;
};

export type RegisterTaxonDataProps = {
	id: number;
	register_type: number;
	bio_group: string;
	reference: string; 
	notify: boolean; 
	name: string;
	email: string;
	response: string;
	is_solved: string;
	is_sent: string;
	createdAt: string;
	updatedAt: string;
};

export type ExpertListProps = {
	rows: ExpertDataProps[];
	count: number;
};

export type FeedbackListProps = {
	rows: FeedbackDataProps[];
	count: number;
};

export type RegisterTaxonListProps = {
	rows: RegisterTaxonDataProps[];
	count: number;
};

export type NewsListProps = {
	rows: NewsDataProps[];
	count: number;
};

export type ArticleListProps = {
	rows: ArticleDataProps[];
	count: number;
};

export type DownloadListProps = {
	rows: DownloadDataProps[];
	count: number;
};

export type ApiResponseListProps = {
	rows: ApiResponseDataProps[];
	count: number;
};
