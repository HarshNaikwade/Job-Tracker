import React, { useState } from "react";
import {
  auth,
  signInWithEmailAndPassword,
  signOut,
  db,
  getDoc,
  doc,
} from "../firebase";
import {
  TextField,
  Button,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return; // Prevent empty login attempts
    setLoading(true);
    setError("");

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // 🔹 Check Firestore if the user exists in allowedUsers collection
      const userRef = doc(db, "allowedUsers", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError(true);
        await signOut(auth); // ❌ Logout unauthorized user
      } else {
        setUser(user); // ✅ Grant access
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  // 🔹 Handle "Enter" key to trigger login
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default form submission behavior
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundColor: "#F0F2F5",
      }}
    >
      <Box
        sx={{
          width: "55%",
          maxWidth: 1000,
          backgroundColor: "#FFFFFF",
          padding: 3,
          borderRadius: 3,
          boxShadow: 3,
          position: "relative",
        }}
      >
        <h2>Login</h2>

        {/* Wrap inputs in a form to enable Enter key handling */}
        <form onKeyDown={handleKeyDown}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Box sx={{ marginTop: 2 }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <Button variant="contained" color="primary" onClick={handleLogin}>
                Login
              </Button>
            )}
          </Box>
        </form>
      </Box>

      {/* 🔹 Single Snackbar Notification for Access Denied */}
      <Snackbar
        open={error}
        autoHideDuration={5000}
        onClose={() => setError(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Positioning
      >
        <Alert
          onClose={() => setError(false)}
          severity="error"
          variant="filled"
        >
          Access Denied! Contact Admin.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
