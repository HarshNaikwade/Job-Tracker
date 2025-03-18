import React, { useState } from "react";
import {
  auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  provider,
} from "../firebase";
import {
  TextField,
  Button,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
  Typography,
  Stack,
  useTheme,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Google, Visibility, VisibilityOff } from "@mui/icons-material";

const PasswordField = ({ password, setPassword }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      label="Password"
      type={showPassword ? "text" : "password"}
      fullWidth
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      variant="outlined"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                edge="end"
                aria-label="toggle password visibility"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

const Login = ({ setUser }) => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (method) => {
    setLoading(true);
    setError("");
    try {
      const result =
        method === "google"
          ? await signInWithPopup(auth, provider)
          : await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin("email");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          border: 2,
          borderColor: theme.palette.divider,
          borderRadius: 2,
          boxShadow: 3,
          textAlign: "center",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Login
        </Typography>

        <Stack spacing={2} component="form" onKeyDown={handleKeyDown}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordField password={password} setPassword={setPassword} />

          <Box>
            {loading ? (
              <CircularProgress sx={{ alignSelf: "center" }} />
            ) : (
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleLogin("email")}
                  fullWidth
                >
                  Login with Email
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Google />}
                  onClick={() => handleLogin("google")}
                  fullWidth
                >
                  Login with Google
                </Button>
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
