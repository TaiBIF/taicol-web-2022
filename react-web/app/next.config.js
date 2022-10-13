const path = require('path');

module.exports = {
async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
	env: {
		ROOT: __dirname,
		DEFAULT_LOCALE: 'zh',
		SECRET_COOKIE_PASSWORD:
			'D9YMGgtE5WdLMpUujnu1NuJWHwse7fYfMWeF6zmqMsDU9dwoQ3Le8wqHWzutvuHD3G3frssKKrQjHixetMk1Cn3mPdQ31uPid9wz',
		SECRET_COOKIE_NAME: 'uberr2000',
	},
	trailingSlash: true,
	reactStrictMode: false,
	experimental: {
		esmExternals: false,
		jsconfigPaths: true, // enables it for both jsconfig.json and tsconfig.json
	},
	webpack: (config) => {
		config.resolve.fallback = { fs: false,"child_process": false, };
		config.resolve.alias = {
			...config.resolve.alias,
			apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision'),
		};

		return config;
	},
};
