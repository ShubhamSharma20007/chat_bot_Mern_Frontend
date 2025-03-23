import React, { createContext, useContext, useEffect, useState } from "react";
import { AUTH_STATUS } from "../helpers/api";
import { Instance } from "../lib/Instance";
type User = {
  _id: string;
  username: string;
  email: string;
  chats?: string[];
};

type UserAuth = {
  isLoggedIn: boolean;
  user: User | null;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export const AuthContext = createContext<UserAuth | null>(null!);

export const AuthContextProvide = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  useEffect(() => {
    const authSatus = async () => {
      try {
        const req = await Instance.get(AUTH_STATUS);
        const res = await req.data;

        if (res.success) {
          setUser(res.data);
          setIsLoggedIn(true);
        }
      } catch (error: any) {
        console.log(error);
      }
    };
    authSatus();
  }, []);
  const value = {
    user,
    isLoggedIn,
    setIsLoggedIn,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvide");
  }
  return context;
};
