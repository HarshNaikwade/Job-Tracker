import React, { useState } from "react";
import Login from "./components/Login";
import JobList from "./components/JobList";
import { auth, signOut } from "./firebase";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Avatar,
  Tooltip,
  MenuItem,
  Switch,
  CssBaseline,
  ThemeProvider,
  createTheme,
  styled,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";

// 🔹 Custom MUI Switch (Dark Mode Toggle)
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#8796A5",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: theme.palette.mode === "dark" ? "#003892" : "#001e3c",
    width: 32,
    height: 32,
    "&::before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff"
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
    borderRadius: 20 / 2,
  },
}));

const App = () => {
  const [user, setUser] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // 🔹 Theme Toggle Function
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? "#1e1e1e" : "#ffffff", // Softer dark gray
        paper: darkMode ? "#2a2a2a" : "#f5f5f5", // Slightly lighter than default
      },
      primary: {
        main: darkMode ? "#90caf9" : "#1976d2", // Professional blue tone
      },
      secondary: {
        main: darkMode ? "#f48fb1" : "#d81b60", // Subtle accent color
      },
      text: {
        primary: darkMode ? "#e0e0e0" : "#212121", // Softer white for readability
        secondary: darkMode ? "#b0b0b0" : "#616161",
      },
    },
  });

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setAnchorElUser(null);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        {user ? (
          <>
            <AppBar>
              <Toolbar>
                <Typography
                  variant="h6"
                  noWrap
                  sx={{ flexGrow: 1, fontWeight: 700 }}
                >
                  Job Application Tracker
                </Typography>

                <Tooltip
                  title={
                    darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  <IconButton
                    onClick={() => setDarkMode(!darkMode)}
                    color="inherit"
                  >
                    {darkMode ? <Brightness7 /> : <Brightness4 />}
                  </IconButton>
                </Tooltip>

                {user && (
                  <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                    <Tooltip title="Open settings">
                      <IconButton onClick={handleOpenUserMenu}>
                        <Avatar alt="User Avatar" />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorElUser}
                      open={Boolean(anchorElUser)}
                      onClose={handleCloseUserMenu}
                    >
                      <Typography sx={{ pl: 2, pr: 2 }}>
                        {user.email}
                      </Typography>
                      <MenuItem onClick={handleLogout}>
                        <Typography textAlign="center">Logout</Typography>
                      </MenuItem>
                    </Menu>
                  </Box>
                )}
              </Toolbar>
            </AppBar>
            <JobList />
          </>
        ) : (
          <Login setUser={setUser} />
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;
