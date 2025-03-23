import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createTheme, ThemeProvider } from "@mui/material";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { AuthContextProvide } from "./context/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./context/SocketContext.tsx";
const theme = createTheme({
  typography: {
    fontFamily: "Roboto,serif",
    allVariants: {
      color: "white",
    },
  },
});
createRoot(document.getElementById("root")!).render(
  <AuthContextProvide>
    <SocketProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Toaster />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </SocketProvider>
  </AuthContextProvide>
);
