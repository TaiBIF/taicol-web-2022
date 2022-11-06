import type { OptionProp } from 'src/types';

export const roles = ['admin', 'user'] as const;
export const filetypes = ['csv', 'pdf','doc','txt'] as const;
export const categoryTypes = ['news', 'article','download'] as const;

export type Role = typeof roles[number];
export type FileType = typeof filetypes[number];
export type CategoryType = typeof categoryTypes[number];

export type DownloadFileTypeOption = OptionProp & {
  value: FileType;
}

export type RoleOption = OptionProp & {
	value: Role;
};

export type CategoryOption = OptionProp & {
	value: CategoryType;
};

export const RoleOptions: RoleOption[] = [
	{
		label: 'Administrator',
		value: 'admin'
	},
];

export const DownloadFileTypeOptions: DownloadFileTypeOption[] = [
	{ label: 'CSV',value: 'csv'},
	{ label: 'PDF',value: 'pdf'},
	{ label: 'DOC',value: 'doc'},
	{ label: 'TXT',value: 'txt'},
];

export const CategoryTypeOptions: CategoryOption[] = [
	{
		label: 'News',
		value: 'news',
	},
	{
		label: 'Article',
		value: 'article',
	},
	{
		label: 'Download',
		value: 'download',
	},
];

