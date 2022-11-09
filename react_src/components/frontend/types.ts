export type TaxonCountProps = {
  img: string;
  title: string;
  enTitle: string | React.ReactNode;
  count: number;
  type:string;
  CircleClassName: string;
  tooltip?: string;
}

export type NewsDataProps = {
  title: string,
  description: string,
  slug: string,
  publishedDate: string,
  updatedAt: string;
  Category: {
    name: string,
    color: string,
  };
}

export type ArticleDataProps = {
  category: string,
  title: string,
  author: string,
  authorInfo: string,
  slug:string,
  updatedAt: string;
  description: string,
  publishedDate: string,
  Category: {
    name: string,
    color: string,
  };
}

export type DownloadDataProps = {
  category: string,
  Category: {id:string},
  title: string,
  DownloadFiles: DownloadFileDataProps[],
  description: string,
  updatedAt:string
}

export type DownloadFileDataProps = {
  url: string,
  type: string,
}

export type BreadCrumbProps = {
  title: string;
  href?: string;
}

export type NewsListProps = {
	rows: NewsDataProps[];
	count: number;
};

export type ArticleListProps = {
	rows: ArticleDataProps[];
	count: number;
};

export type Link = {
  label: string;
  href: string;
}

export type KingdomProps = {
  name: [string, string];
  count: number;
}

export type RankProps = {
  zhTWTitle: string;
  enTitle: string;
  count: number;
  className: string;
}

export type EndemicProps = {
  name: string;
  image: string;
  count: number;
  total: number;
  ratio: string;
}

export type SourceProps = {
  name: string;
  color: string;
  count: number;
}

export type SpeciesCompareProps = {
  name: string;
  TaiwanCount: number;
  GlobalCount: number;
}

export type SpeciesProps = {
  name: string;
  count: number;
}

export type CompareTableDataProps = {
  kingdomName: string;
  phylumName: string;
  className: string;
  globalCount: number;
  taiwanCount: number;
  twProvider: string;
}

export type whereConditionProp = {
    [key: string]: any
}

export type CategoryTypes = 'news' | 'article' | 'download';


export type CategoryDataProps = {
	id: number;
	type: CategoryTypes;
	name: string;
	sort: number;
};