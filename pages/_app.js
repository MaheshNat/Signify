import Layout from '../components/Layout';
import 'bootswatch/dist/darkly/bootstrap.min.css';

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
