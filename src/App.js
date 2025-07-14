import React from "react";
import AllRoutes from "./Routes/AllRoutes";
import { DriverStatusProvider } from "./context/DriverStatusContext";
import {AuthProvider} from "./context/AuthContext";
function App() {
  return (
    <AuthProvider>
    <DriverStatusProvider>
      <AllRoutes />
    </DriverStatusProvider>
    </AuthProvider>
  );
}

export default App;
