import React, { useEffect } from "react";
import { Box, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { CustomizeInputs } from "../../../shared/CustomizeInputs";
import { CiLogin } from "react-icons/ci";
import toast from "react-hot-toast";
import { Instance } from "../../../lib/Instance";
import { LOGIN } from "../../../helpers/api";
import { useAuth } from "../../../context/AuthContext";
const Login = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setUser, isLoggedIn, user } = useAuth();
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    //  post the data
    try {
      toast.loading("login...", {
        id: "login",
      });
      const req = await Instance.post(LOGIN, data);
      const res = await req.data;
      console.log(res);
      if (res.success) {
        toast.success(res.message, {
          id: "login",
        });
        setUser(res.data.user);
        setIsLoggedIn(true);
        // window.location.href =import.meta.env.VITE_BACKEND_URL + "/auth";
        (e.target as HTMLFormElement).reset();
      }
    } catch (error: any) {
      if (error.response.data.errors && error.response.data.errors.length > 0) {
        toast.error(error.response.data.errors[0].msg, {
          id: "login",
        });
      } else {
        toast.error("Sign in failed", {
          id: "login",
        });
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/chat");
    }
  }, [user]);
  return (
    <Box
      display="flex"
      justifyContent={"center"}
      alignItems={"center"}
      flex={1}
      height={"100%"}
      width={"100%"}
    >
      <form
        onSubmit={handleLoginSubmit}
        className="w-full  max-w-sm grid gap-5 shadow-md p-5 rounded-md "
      >
        <div>
          <h1 className="text-lg text-center font-semibold ">Sign In</h1>
          <p className="text-sm text-center text-gray-500 my-0">
            Login with your credentials
          </p>
        </div>

        <CustomizeInputs label="Email" name="email" type="email" />
        <CustomizeInputs label="Password" name="password" type="password" />
        <Box className="text-sm text-end text-gray-500 my-0">
          Don't have an account?{" "}
          <Link to={"/register"} className="text-blue-500 font-medium">
            Sign Up
          </Link>
        </Box>
        <Button endIcon={<CiLogin />} type="submit" variant="contained">
          {" "}
          Sign In
        </Button>
      </form>
    </Box>
  );
};

export default Login;
