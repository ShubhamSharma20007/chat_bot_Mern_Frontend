import React from "react";
import { Box, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { CustomizeInputs } from "../../../shared/CustomizeInputs";
import { Instance } from "../../../lib/Instance";
import { REGISTER } from "../../../helpers/api";
import toast from "react-hot-toast";
const Register = () => {
  const navigate = useNavigate();
  const handleRegisterForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    //  post the data
    try {
      toast.loading("Registering...", {
        id: "register",
      });
      const req = await Instance.post(REGISTER, data);
      const res = await req.data;

      if (res.success) {
        toast.success(res.message, {
          id: "register",
        });
        navigate("/");
        (e.target as HTMLFormElement).reset();
      }
    } catch (error: any) {
      console.log(error);
      if (error.response.data.errors && error.response.data.errors.length > 0) {
        toast.error(error.response.data.errors[0].msg, {
          id: "register",
        });
      } else {
        toast.error("Sign up failed", {
          id: "register",
        });
      }
    }
  };
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
        onSubmit={handleRegisterForm}
        className="w-full max-w-sm grid gap-5 shadow-md p-5 rounded-md "
      >
        <div>
          <h1 className="text-lg text-center font-semibold ">Sign Up </h1>
          <p className="text-sm text-center text-gray-500 my-0">
            Please enter the your valid credentials
          </p>
        </div>
        <CustomizeInputs label="Username" name="username" type="text" />
        <CustomizeInputs label="Email" name="email" type="email" />
        <CustomizeInputs label="Password" name="password" type="password" />
        <p className="text-sm text-end text-gray-500 my-0">
          Already have an account?{" "}
          <Link to={"/"} className="text-blue-500 font-medium">
            Sign In
          </Link>
        </p>
        <Button title="Sign Up" type="submit" variant="contained">
          {" "}
          Sign Up
        </Button>
      </form>
    </Box>
  );
};

export default Register;
