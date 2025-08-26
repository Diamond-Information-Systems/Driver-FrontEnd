import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DriverDashboard from '../pages/Dashboard/DriverDashboard';
import EnhancedDriverDashboard from '../pages/Dashboard/EnhancedDriverDashboard';

/**
 * Example integration showing both old and new dashboard routes
 * You can gradually migrate users or A/B test between versions
 */

function DashboardRoutes() {
  return (
    <Routes>
      {/* Original dashboard - keep for gradual migration */}
      <Route path="/dashboard" element={<DriverDashboard />} />
      
      {/* Enhanced dashboard with drawer system */}
      <Route path="/dashboard/enhanced" element={<EnhancedDriverDashboard />} />
      
      {/* Default route - can switch based on feature flags */}
      <Route 
        path="/dashboard/default" 
        element={
          // Example feature flag usage
          process.env.REACT_APP_USE_ENHANCED_DASHBOARD === 'true' 
            ? <EnhancedDriverDashboard />
            : <DriverDashboard />
        } 
      />
    </Routes>
  );
}

export default DashboardRoutes;
