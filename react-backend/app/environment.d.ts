declare global {
	namespace NodeJS {
		interface ProcessEnv {
			SMTP_USERNAME?: string;
			SMTP_PASSWORD?: string;
			SMTP_HOST?: string;
			SMTP_PORT?: string;
			SMTP_FROM?: string;
			NEXT_PUBLIC_DOMAIN: string;
			NEXT_PUBLIC_WEB_PUBLIC_DOMAIN: string;
			SECRET: string;
			NEXTAUTH_SECRET : string;
			DB_NAME: string;
			DB_ADAPTER: string;
			DB_HOST: string;
			DB_PORT: string;
			DB_USER: string;
			DB_PASSWORD: string;
			DATABASE_URL: string;
			NEXT_PUBLIC_PAGINATE_LIMIT: string;
			NEXT_PUBLIC_API_URL: string;
			NEXT_PUBLIC_IFRAME_URL: string;
			NEXT_PUBLIC_AWS_ACCESS_KEY_ID: string;
			NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY: string;
			AWS_ACCESS_KEY_ID: string;
			AWS_SECRET_ACCESS: string;
			NEXT_PUBLIC_AWS_SES_REGION_NAME: string;
			NEXT_PUBLIC_AWS_SES_REGION_ENDPOINT: string;
		}
	}
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
