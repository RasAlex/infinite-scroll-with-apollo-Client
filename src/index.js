import {StrictMode} from 'react';
import ReactDOM from 'react-dom';

import ListLaunches from './ListLaunches';

const rootElement = document.getElementById('root');
ReactDOM.render(
  <StrictMode>
    <ListLaunches />
  </StrictMode>,
  rootElement
);
