import TextEditor from "./google-docs/TextEditor";
import {Routes, Route} from "react-router-dom"
import AuthProvider from "../contexts/AuthContext";
import Login from "./authentication/Login";
import Signup from "./authentication/Signup";
import PrivateRoute from "./authentication/PrivateRoute";
import ForgotPassword from "./authentication/ForgotPassword";
import UpdateProfile from "./authentication/UpdateProfile";
import Profile from "./authentication/Profile";
import Dashboard from "./google-docs/Dashboard";
import NavbarComponent from "./google-docs/Navbar";
import ContributionStats from "./google-docs/ContributionStats";


function App() {
  return (
    <AuthProvider>
         <NavbarComponent />
         <Routes>
            <Route
               exact
               path="/"
               element={
                  <PrivateRoute>
                     <Dashboard />
                  </PrivateRoute>
               }
            />
            <Route
               path="/user"
               element={
                  <PrivateRoute>
                     <Profile />
                  </PrivateRoute>
               }
            />
            <Route
               path="/update-profile"
               element={
                  <PrivateRoute>
                     <UpdateProfile />
                  </PrivateRoute>
               }
            />
            <Route
               path="/document/:id"
               element={
                  <PrivateRoute>
                     <TextEditor />
                  </PrivateRoute>
               }
            />
            <Route
               path="/stats/document/:id"
               element={
                  <PrivateRoute>
                     <ContributionStats />
                  </PrivateRoute>
               }
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
         </Routes>
      </AuthProvider>
  );
}

export default App;
