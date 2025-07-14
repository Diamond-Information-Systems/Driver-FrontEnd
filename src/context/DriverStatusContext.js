import React, { createContext, useState } from "react";

export const DriverStatusContext = createContext();

export const DriverStatusProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <DriverStatusContext.Provider value={{ isOnline, setIsOnline }}>
      {children}
    </DriverStatusContext.Provider>
  );
};
