import React from "react";
import { SpeedInsights } from '@vercel/speed-insights/react';

import AllRoutes from "./Routes/AllRoutes";
import { DriverStatusProvider } from "./context/DriverStatusContext";
import {AuthProvider} from "./context/AuthContext";
function App() {
  return (
    <AuthProvider>
    <DriverStatusProvider>
      <AllRoutes />
      <SpeedInsights />
    </DriverStatusProvider>
    </AuthProvider>
  );
}

export default App;
