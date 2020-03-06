import { useEffect } from 'react';

import BrowserEnvironment from './BrowserEnvironment';
import DolbyEnvironment from './DolbyEnvironment';

const ControllerShim = () => {
  useEffect(() => {
    if (window.controllerEnvironment) return;

    console.log('Initializing Controller shim layer');

    const urlParams = new URLSearchParams(window.location.search);
    const shim = urlParams.get('shim');

    if (shim === 'dolby') {
      console.log('Dolby param found. Setting up DolbyEnvironment');

      const dapi = window.dapi;

      if (!dapi) {
        console.error('No dapi detected, aborting');
      }

      window.controllerEnvironment = Promise.resolve(new DolbyEnvironment(dapi));
    } else {
      console.log('No shim param found. Setting up BrowserEnvironment');

      window.controllerEnvironment = Promise.resolve(new BrowserEnvironment());
    }
  }, []);

  return null;
};

export default ControllerShim;
