import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import Router from '../../router/Router'

const DefaultComponent: React.FC = () => {
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
};

export default DefaultComponent;
