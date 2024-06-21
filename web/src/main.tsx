import ReactDOM from 'react-dom/client';

import App from './App';

import "./styles/index.css";
import "./styles/markdown.scss";

const rootEle = document.getElementById('root');

if (rootEle) {
  ReactDOM.createRoot(rootEle).render(
    <div>
      <App />
    </div>
  )
}