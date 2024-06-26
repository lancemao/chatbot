import ReactDOM from 'react-dom/client';

import App from './App';

import "./styles/index.css";
import "./styles/markdown.scss";
import { BrowserRouter } from 'react-router-dom';

const rootEle = document.getElementById('root');

if (rootEle) {
  ReactDOM.createRoot(rootEle).render(
    <div>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </div>
  )
}