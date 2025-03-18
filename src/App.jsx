import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import JobList from "./components/JobList";
import AutomationToggle from "./components/AutomationToggle";
import { auth, signOut } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
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
  CssBaseline,
  ThemeProvider,
  createTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";

const App = () => {
  // Detect system theme preference
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const [darkMode, setDarkMode] = useState(systemPrefersDark);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load theme preference from localStorage or default to system preference
  useEffect(() => {
    const storedMode = localStorage.getItem("darkMode");
    if (storedMode !== null) {
      setDarkMode(storedMode === "true");
    } else {
      setDarkMode(systemPrefersDark);
    }
  }, [systemPrefersDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Persist user session using Firebase's onAuthStateChanged observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Set loading to false once auth state is determined
    });
    return () => unsubscribe();
  }, []);

  // Toggle dark mode and save preference
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAnchorElUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // User menu handlers
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Toggle mobile drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Create custom theme
  const customTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? "#282c34" : "#F0F2F5",
        paper: darkMode ? "#282c34" : "#FFFFFF",
      },
      primary: {
        main: darkMode ? "#61dafb" : "#1976d2",
      },
      text: {
        primary: darkMode ? "#FFFFFF" : "#212121",
      },
    },
  });

  // Determine if the screen is mobile sized
  const isMobile = useMediaQuery(customTheme.breakpoints.down("sm"));

  // Drawer content for mobile view (only visible when user is logged in)
  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        {user && (
          <>
            <ListItem>
              <ListItemText primary={user.email} />
            </ListItem>
            <Divider />
            <ListItem>
              <AutomationToggle
                automationEnabled={automationEnabled}
                setAutomationEnabled={setAutomationEnabled}
              />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      {loading ? (
        // Show a loader until the auth state is determined
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <div>
          {/* Render AppBar and mobile Drawer only when user is logged in */}
          {user && (
            <>
              <AppBar position="fixed">
                <Toolbar>
                  {isMobile && (
                    <IconButton
                      color="inherit"
                      edge="start"
                      onClick={handleDrawerToggle}
                    >
                      <MenuIcon />
                    </IconButton>
                  )}
                  <Typography
                    variant="h6"
                    sx={{
                      flexGrow: 1,
                      fontWeight: 700,
                      textAlign: isMobile ? "center" : "left",
                    }}
                  >
                    Job Application Tracker
                  </Typography>
                  <Tooltip
                    title={
                      darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                    }
                  >
                    <IconButton onClick={toggleDarkMode} color="inherit">
                      {darkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                  </Tooltip>
                  {/* Desktop-only user details */}
                  {!isMobile && user && (
                    <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                      <Typography sx={{ mr: 2 }}>{user.email}</Typography>
                      <Tooltip title="Open settings">
                        <IconButton onClick={handleOpenUserMenu}>
                          <Avatar alt="User Avatar" src={user.photoURL} />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        anchorEl={anchorElUser}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                      >
                        <MenuItem>
                          <AutomationToggle
                            automationEnabled={automationEnabled}
                            setAutomationEnabled={setAutomationEnabled}
                          />
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleLogout();
                            handleCloseUserMenu();
                          }}
                        >
                          <Typography textAlign="center">Logout</Typography>
                        </MenuItem>
                      </Menu>
                    </Box>
                  )}
                </Toolbar>
              </AppBar>
              {/* Spacer to offset fixed AppBar */}
              <Toolbar />
              {isMobile && (
                <Drawer
                  anchor="left"
                  open={mobileOpen}
                  onClose={handleDrawerToggle}
                  ModalProps={{ keepMounted: true }}
                >
                  {drawer}
                </Drawer>
              )}
            </>
          )}
          {user ? (
            <JobList currentUser={user} automationEnabled={automationEnabled} />
          ) : (
            <Login setUser={setUser} />
          )}
        </div>
      )}
    </ThemeProvider>
  );
};

export default App;
