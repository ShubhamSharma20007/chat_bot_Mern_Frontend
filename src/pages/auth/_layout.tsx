import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="flex overflow-hidden w-full h-screen items-center justify-center">
      <div className="w-1/2  bg-black flex justify-center h-full items-center">
        <h1 className="text-white text-5xl font-bold text-center">
          Welcome to <br /> Chat Bot App
        </h1>
      </div>
      <div className="w-1/2 bg-white flex justify-center items-center h-full">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
