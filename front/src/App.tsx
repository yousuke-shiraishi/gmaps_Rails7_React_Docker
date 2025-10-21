import React from 'react';
import './App.css';
import Grid from '@mui/material/Grid';
import DefaultComponent from './components/header/index';

const App: React.FC = () => {
  return (
    <div className="App">
      <Grid container className="wrap">
        <DefaultComponent />
      </Grid>
    </div>
  );
};

export default App;
