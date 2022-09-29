declare global {
	namespace NodeJS {
		interface ProcessEnv {
			SMTP_USERNAME?: string;
			SMTP_PASSWORD?: string;
			SMTP_HOST?: string;
			SMTP_PORT?: string;
			SMTP_FROM?: string;
			NEXTAUTH_URL_INTERNAL: string;
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
      NEXT_PUBLIC_DOMAIN: string;
      DEFAULT_ADMIN_EMAIL: string;
      DEFAULT_ADMIN_PASSWORD: string;
		}
	}
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
