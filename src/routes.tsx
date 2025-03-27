import { Route, Routes } from "react-router-dom";

import Register from "./pages/auth/register";
import Login from "./pages/auth/login";
import AuthLayout from "./pages/auth/_layout";
import Chat from "./pages/chat";
import Preview from "./pages/preview";
import Dashboard from "./pages/dashboard";

const Router = () => {
  return (
    <Routes>
      {/* {auth.isLoggedIn && auth.user && ( */}
      <Route path="/chat" element={<Chat />} />
      {/* <Route path="/chat/:id" element={<DynamicChat />} /> */}
      {/* )} */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route path="/preview" element={<Preview/>} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="*" element={<h1>Page Not Found</h1>} />
    </Routes>
  );
};

export default Router;
