import React, { useState, useEffect } from "react";
import {
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
} from "@mui/material";

const AutomationToggle = ({ automationEnabled, setAutomationEnabled }) => {
  const [gcpAvailable, setGcpAvailable] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    // Check if GCP project is available by calling a health-check endpoint.
    // Replace the URL with your actual endpoint.
    const checkGCPAvailability = async () => {
      try {
        const response = await fetch("https://example.com/health");
        if (response.ok) {
          setGcpAvailable(true);
        } else {
          setGcpAvailable(false);
        }
      } catch (error) {
        console.error("GCP health check failed:", error);
        setGcpAvailable(false);
      }
    };

    checkGCPAvailability();
  }, []);

  const handleToggle = (event) => {
    if (!gcpAvailable) {
      setAutomationEnabled(false);
      setSnackbarOpen(true);
      return;
    }
    setAutomationEnabled(event.target.checked);
  };

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            checked={automationEnabled}
            onChange={handleToggle}
            color="secondary"
          />
        }
        label="Automate with Gmail"
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="error"
          variant="filled"
        >
          GCP error. Automation is unavailable.
        </Alert>
      </Snackbar>
    </>
  );
};

export default AutomationToggle;
