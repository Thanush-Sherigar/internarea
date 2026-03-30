import {Provider} from 'react-redux';
import {store} from '../store/store';
import "@/styles/globals.css";
export default function App({ Component, pageProps }: any) {
  return (
    <Provider store={store}>
      <Component {...pageProps}/>
    </Provider>
  )
}
