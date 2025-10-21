import { createContext } from 'react';
import { Gmap } from '../interface/Gmap';

const GmapsContext = createContext(
  {} as {
    gmaps: Gmap[];
    setGmaps: React.Dispatch<React.SetStateAction<Gmap[]>>;
  }
);
export default GmapsContext;
