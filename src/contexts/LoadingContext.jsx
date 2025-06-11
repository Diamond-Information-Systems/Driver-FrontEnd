import React, { createContext, useContext, useState } from 'react';
import Splash from '../components/Splash';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {isLoading && <Splash isLoading={true} />}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);