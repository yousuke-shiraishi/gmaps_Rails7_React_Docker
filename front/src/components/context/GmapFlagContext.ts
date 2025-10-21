import { createContext } from 'react';
const GmapFlagContext = createContext(
  {} as {
    gflag: boolean;
    setGmapFlag: React.Dispatch<React.SetStateAction<boolean>>;
  }
);
export default GmapFlagContext;
