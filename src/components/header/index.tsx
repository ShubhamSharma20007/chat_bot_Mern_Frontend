import { AppBar, Box } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import NavigationLink from "../../shared/NavigationLink";
import { useNavigate } from "react-router-dom";

import { Instance } from "../../lib/Instance";
import { AUTH_LOGOUT } from "../../helpers/api";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
const Header = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // remove the params id

  console.log(searchParams.get("tab"));
  const auth = useAuth();
  const handleLogout = async () => {
    try {
      const req = await Instance.post(AUTH_LOGOUT);
      const res = await req.data;
      if (res.success) {
        toast.success("Logout Successful");
        setSearchParams({})
        navigate("/");
        auth.setIsLoggedIn(false);
        auth.setUser(null);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  return (
    <AppBar
      sx={{
        backgroundColor: "#BCCCDC",
        py: 1,
        px: 2,
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      <Box
        justifyContent={"space-between"}
        alignItems={"center"}
        height={"100%"}
        py={1}
        sx={{ display: { md: "flex", sm: "none" } }}
      >
        <img
          width={40}
          className="rounded-full animate-pulse"
          src="https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg"
        />
        <Box sx={{ display: "flex", gap: 3 }}>
          {auth?.isLoggedIn ? (
            <>
              <button
                className="px-4 py-2 bg-blue-600 rounded-md hover:shadow-md hover:scale-105 transition-all duration-300"
                onClick={handleLogout}
              >
                logout
              </button>
            </>
          ) : (
            <>
              <NavigationLink
                bg="#00fffc"
                to="/"
                text="Login"
                textColor="black"
              />
              <NavigationLink
                bg="#51538f"
                to="/register"
                text="Sign Up"
                textColor="white"
              />
            </>
          )}
        </Box>
      </Box>
    </AppBar>
  );
};

export default Header;
