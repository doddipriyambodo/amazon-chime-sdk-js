import ReactDOM from 'react-dom';
import React from 'react';

import App from './components/App';

ReactDOM.render(
  <App name="Chime SDK React Demo" />,
  document.querySelector('#container')
);

if (module && module.hot) {
  module.hot.accept();

}
