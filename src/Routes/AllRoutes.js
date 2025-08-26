import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Splash from "../components/Splash";
import DriverLogin from "../pages/Auth/DriverLogin";
import DriverDashboard from "../pages/Dashboard/DriverDashboard";
import PaymentReturn from "../components/PaymentReturn";
import PaymentCallback from "../components/PaymentCallback";
import "../App.css";
import DriverRegistration from "../pages/Auth/DriverRegistration";
import Earnings from "../pages/Earnings/Earnings";
import Profile from "../pages/Profile/Profile";
import ProfileEdit from "../pages/Profile/ProfileEdit";
import Trips from "../pages/Trips/Trips";
import Wallet from "../pages/Wallet/Wallet";
import Help from "../pages/Help/Help";
import Referrals from "../pages/Referrals/Referrals";
import Account from "../pages/Account/Account";
import ProfileManagement from "../pages/ProfileManagement/ProfileManagement";
import Inbox from "../pages/Inbox/Inbox";
import AppSettings from "../pages/AppSettingsDrawer/AppSettings";
import Sound from "../pages/AppSettingsDrawer/SoundSettings/Sound";
import Navigation from "../pages/AppSettingsDrawer/Navigation/Navigation";
import Accessibility from "../pages/AppSettingsDrawer/Accessibility/Accessibility";
import Communication from "../pages/AppSettingsDrawer/Accessibility/Communication";
import Hearing from "../pages/AppSettingsDrawer/Accessibility/Hearing";
import Notifications from "../pages/AppSettingsDrawer/Accessibility/Notifications";
import Email from "../pages/AppSettingsDrawer/Accessibility/Email";
import CommunicationSettings from "../pages/AppSettingsDrawer/Communication/Communication";
import AutoResponse from "../pages/AppSettingsDrawer/AutoResponse/AutoResponse";
import QuickResponse from "../pages/AppSettingsDrawer/QuickResponse/QuickResponse";
import DarkMode from "../pages/AppSettingsDrawer/DarkMode/DarkMode";
import PinVerification from "../pages/AppSettingsDrawer/PinVerification/PinVerification";
import FollowTrip from "../pages/AppSettingsDrawer/FollowTrip/FollowTrip";
import EmergencyContact from "../pages/AppSettingsDrawer/EmergencyContact/EmergencyContact";
import SpeedLimit from "../pages/AppSettingsDrawer/SpeedLimit/SpeedLimit";
import VideoRecording from "../pages/AppSettingsDrawer/VideoRecording/VideoRecording";
import VehiclesPage from "../pages/Account/Vehicles/VehicleManagement";
import WorkHub from "../pages/Account/WorkHub/WorkHub";
import TaxInformation from "../pages/Tax/TaxInformation";
import Payment from "../pages/Account/Payment/Payment";
import AddressForm from "../pages/Address/Address";
import Tribaalinfo from "../pages/Tribaaal-info/Tribaal-info";
import DocumentRequirements from "../pages/Documents/DocumentRequirements";
import DocumentDetail from "../pages/Documents/DocumentDetail";
import AccountManagement from "../pages/Account/AccountManagement/AccountManagement";
function AllRoutes() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading");

  const handleLogin = () => {
    setLoadingMessage("Logging in");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setLoadingMessage("Logging out");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    setLoadingMessage("");
    setIsLoading(true);

    const splashTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 4000);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  return (
    <Router>
      <Splash isLoading={isLoading} message={loadingMessage} dots={true} />
      {!isLoading && (
        <div className={`app ${showContent ? "fade-in" : ""}`}>
          <Routes>
            <Route path="/payment/return" element={<PaymentReturn />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            {/* register */}
            <Route
              path="/driver-registration"
              element={<DriverRegistration />}
            />
            <Route path="/help" element={<Help />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/tribaal-info" element={<Tribaalinfo />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/dashboard" element={<DriverDashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/account" element={<Account />} />
            <Route path="/profile-management" element={<ProfileManagement />} />
            <Route path="/" element={<DriverLogin />} />

            {/* App Settings */}
            <Route path="/app-settings" element={<AppSettings />} />
            <Route path="/app-settings/sounds-voice" element={<Sound />} />
            <Route path="/app-settings/navigation" element={<Navigation />} />
            <Route
              path="/app-settings/accessibility"
              element={<Accessibility />}
            />
            <Route
              path="/app-settings/accessibility/communication"
              element={<Communication />}
            />
            <Route
              path="/app-settings/accessibility/hearing"
              element={<Hearing />}
            />
            <Route
              path="/app-settings/communication/push-notifications"
              element={<Notifications />}
            />
            <Route
              path="/app-settings/communication/email"
              element={<Email />}
            />
            <Route
              path="/app-settings/communication"
              element={<CommunicationSettings />}
            />
            <Route
              path="/app-settings/auto-responses"
              element={<AutoResponse />}
            />
            <Route
              path="/app-settings/quick-responses"
              element={<QuickResponse />}
            />
            <Route path="/app-settings/night-mode" element={<DarkMode />} />
            <Route
              path="/app-settings/pin-verification"
              element={<PinVerification />}
            />
            <Route
              path="/app-settings/follow-my-trip"
              element={<FollowTrip />}
            />
            <Route
              path="/app-settings/emergency-contacts"
              element={<EmergencyContact />}
            />
            <Route path="/app-settings/speed-limit" element={<SpeedLimit />} />
            <Route
              path="/app-settings/video-recording"
              element={<VideoRecording />}
            />

            {/* Account Settings */}
            <Route path="/account/vehicles" element={<VehiclesPage />} />
            <Route path="/account/work-hub" element={<WorkHub />} />

            {/* Tax Settings */}
            <Route path="/account/tax-info" element={<TaxInformation />} />

             {/* Payment Settings */}
            <Route path="/account/payment" element={<Payment />} />

             {/* Address Settings */}
            <Route path="/account/address" element={<AddressForm />} />

             {/* Document Settings */}
            <Route path="/account/documents" element={<DocumentRequirements />} />
       <Route path="/document-detail/:documentId" element={<DocumentDetail />} />

  {/* Account Management Settings */}
            <Route path="/account/manage" element={<AccountManagement />} />

          </Routes>
        </div>
      )}
    </Router>
  );
}

export default AllRoutes;
// Assuming you have a Profile component
