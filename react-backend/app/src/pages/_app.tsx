// ** Next Imports
import Head from 'next/head';
import { Router } from 'next/router';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';

// ** React Imports
import React from 'react';

// ** Loader Import
import NProgress from 'nprogress';

// ** Emotion Imports
import { CacheProvider } from '@emotion/react';
import type { EmotionCache } from '@emotion/cache';

// ** Config Imports
import themeConfig from 'src/configs/themeConfig';

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout';
// import FrontendLayout from 'src/layouts/FrontendLayout';
import ThemeComponent from 'src/@core/theme/ThemeComponent';

// ** Contexts
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext';

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache';

// ** SWR Imports
import { SWRConfig, Fetcher } from 'swr';

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css';

// ** Global css styles
import 'nprogress/nprogress.css';
import '../../styles/globals.css';
// import '../../styles/theme.css';
import '../../styles/select2.css';
import '../../styles/tailwind.css';
import 'styles/nice-select.css'
// import '../../styles/markdown.css';


import { SessionProvider, SessionProviderProps } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps &
	SessionProviderProps & {
		Component: NextPage;
		emotionCache: EmotionCache;
	};

const clientSideEmotionCache = createEmotionCache();

// ** Pace Loader
if (themeConfig.routingLoader) {
	Router.events.on('routeChangeStart', () => {
		NProgress.start();
	});
	Router.events.on('routeChangeError', () => {
		NProgress.done();
	});
	Router.events.on('routeChangeComplete', () => {
		NProgress.done();
	});
}

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const [mount,setMount] = React.useState<boolean>(false)

	async function fetcher<JSON = any>(input: RequestInfo, init?: RequestInit): Promise<JSON> {
		const res = await fetch(input, init);
		return res.json();
	}
  React.useEffect(() => {
    setMount(true)
		const handleRouteStart = () => NProgress.start();
		const handleRouteDone = () => NProgress.done();

		Router.events.on('routeChangeStart', handleRouteStart);
		Router.events.on('routeChangeComplete', handleRouteDone);
		Router.events.on('routeChangeError', handleRouteDone);

		return () => {
			// Make sure to remove the event handler on unmount!
			Router.events.off('routeChangeStart', handleRouteStart);
			Router.events.off('routeChangeComplete', handleRouteDone);
			Router.events.off('routeChangeError', handleRouteDone);
		};
	}, []);

	// Variables
	const getLayout = Component.getLayout ?? ((page: React.ReactNode) => <UserLayout>{page}</UserLayout>);

	return (
		<SnackbarProvider maxSnack={3} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
			<SessionProvider session={props.session}>
				<CacheProvider value={emotionCache}>
					<SWRConfig
						value={{
							fetcher: fetcher,
							onError: (err) => {
								console.error(err);
							},
						}}
					>
						<Head>
							{/* <title>{`${themeConfig.templateName} - Material Design React Admin Template`}</title> */}
							<title>{`TaiCOL admin`}</title>
							{/* <meta
								name="description"
								content={`${themeConfig.templateName} – Material Design React Admin Dashboard Template – is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.`}
							/> */}
							{/* <meta name="keywords" content="Material Design, MUI, Admin Template, React Admin Template" /> */}
							<meta name="viewport" content="initial-scale=1, width=device-width" />
            </Head>
            {mount &&
            //   window.location.pathname.startsWith('/admin') ?
                <SettingsProvider>
                  <SettingsConsumer>
                    {({ settings }) => {
                      return <ThemeComponent settings={settings}>{getLayout(<Component {...pageProps} />)}</ThemeComponent>;
                    }}
                  </SettingsConsumer>
                </SettingsProvider>
                // : <FrontendLayout><Component /></FrontendLayout>
          }
        </SWRConfig>
				</CacheProvider>
			</SessionProvider>
		</SnackbarProvider>
	);
};

export default App;
