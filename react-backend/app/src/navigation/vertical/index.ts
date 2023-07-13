// ** Icon imports
import Login from 'mdi-material-ui/Login';
import Table from 'mdi-material-ui/Table';
import CubeOutline from 'mdi-material-ui/CubeOutline';
import HomeOutline from 'mdi-material-ui/HomeOutline';
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline';
import AccountOutline from 'mdi-material-ui/AccountOutline';
import CogOutline from 'mdi-material-ui/CogOutline';
import DownloadBoxOutline from 'mdi-material-ui/DownloadBoxOutline';
import NewspaperVariantOutline from 'mdi-material-ui/NewspaperVariantOutline';
import CardOutline from 'mdi-material-ui/CardOutline';
import BookOpenOutline from 'mdi-material-ui/BookOpenOutline';
import AlertCircleOutline from 'mdi-material-ui/AlertCircleOutline';
import GoogleCirclesExtended from 'mdi-material-ui/GoogleCirclesExtended';

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types';

const navigation = (): VerticalNavItemsType => {
	return [
		{
			title: 'Dashboard',
			icon: HomeOutline,
			path: '/',
		},
		{
			title: 'Users',
			icon: AccountOutline,
			path: '/admin/user',
		},
		{
			sectionTitle: 'News',
		},
		{
			title: 'News List',
			icon: NewspaperVariantOutline,
			path: '/admin/news',
		},
		{
			title: 'News Categories',
			icon: CardOutline,
			path: '/admin/category?type=news',
		},
		{
			sectionTitle: 'Article',
		},
		{
			title: 'Article List',
			icon: BookOpenOutline,
			path: '/admin/article',
		},
		{
			title: 'Article Categories',
			icon: CardOutline,
			path: '/admin/category?type=article',
		},
		{
			sectionTitle: 'Download',
		},
		{
			title: 'Download List',
			icon: DownloadBoxOutline,
			path: '/admin/download',
		},
		{
			title: 'Download Categories',
			icon: CardOutline,
			path: '/admin/category?type=download',
		},
		{
			sectionTitle: 'API Doc',
		},
		{
			title: 'API Markdown',
			icon: DownloadBoxOutline,
			path: '/admin/apidoc/update',
		},
		{
			sectionTitle: 'API ENG Doc',
		},
		{
			title: 'API English Markdown',
			icon: DownloadBoxOutline,
			path: '/admin/apidoc_eng/update',
		},
	];
};

export default navigation;
