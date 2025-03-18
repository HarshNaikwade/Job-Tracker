import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Fab,
  CircularProgress,
  useTheme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Check, Add, Delete } from "@mui/icons-material";
import FlipMove from "react-flip-move";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { keyframes } from "@mui/system";

// Define keyframes for the gradient animation
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Style object for unsaved changes
const unsavedStyle = {
  background:
    "radial-gradient(circle, rgba(150, 150, 150, 0.6) 0%, rgba(255,255,255,0) 100%)",
  backgroundSize: "400% 400%",
  animation: `${gradientAnimation} 3s ease infinite`,
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const JobList = ({ currentUser }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [jobs, setJobs] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    if (!currentUser) return;
    const fetchJobs = async () => {
      const q = query(
        collection(db, "jobs"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const jobsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(jobsList);
    };

    fetchJobs();
  }, [currentUser]);

  const handleChange = (id, field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id) => {
    if (editedData[id]) {
      setSaving((prev) => ({ ...prev, [id]: "loading" }));
      const lastUpdated = new Date().toISOString();
      const updatedData = { ...editedData[id], lastUpdated };

      const jobRef = doc(db, "jobs", id);
      await updateDoc(jobRef, updatedData);

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === id ? { ...job, ...updatedData } : job
        )
      );

      // Remove the unsaved changes since the job is now saved
      setEditedData((prev) => {
        const newData = { ...prev };
        delete newData[id];
        return newData;
      });

      setSaving((prev) => ({ ...prev, [id]: "done" }));
      setTimeout(() => {
        setSaving((prev) => ({ ...prev, [id]: null }));
      }, 1500);
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "jobs", id));
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
  };

  const handleAddJob = async () => {
    if (!currentUser) return;
    const newJob = {
      company: "",
      role: "",
      date: "",
      status: "Applied",
      lastUpdated: new Date().toISOString(),
      userId: currentUser.uid,
    };

    const docRef = await addDoc(collection(db, "jobs"), newJob);
    setJobs((prevJobs) => [{ id: docRef.id, ...newJob }, ...prevJobs]);
  };

  // Always sort the jobs by lastUpdated (most recent on top)
  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const aDate = a.lastUpdated ? new Date(a.lastUpdated) : new Date(0);
      const bDate = b.lastUpdated ? new Date(b.lastUpdated) : new Date(0);
      return bDate - aDate; // descending order
    });
  }, [jobs]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "80vh",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 900,
          mx: "auto",
          p: 3,
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: theme.palette.background.paper,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Job Applications
        </Typography>

        {isMobile ? (
          // Mobile view: Render each job as a card
          <Box
            sx={{
              overflowY: "auto",
              maxHeight: "70vh",
              pr: 1,
            }}
          >
            <FlipMove>
              {sortedJobs.length > 0 ? (
                sortedJobs.map((job) => (
                  <Paper
                    key={job.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: 2,
                      borderColor: theme.palette.divider,
                      borderRadius: 2,
                      boxShadow: 3,
                      // Add unsaved animation if there are unsaved changes
                      ...(editedData[job.id] && unsavedStyle),
                    }}
                    elevation={2}
                  >
                    <TextField
                      label="Company"
                      value={editedData[job.id]?.company ?? job.company}
                      onChange={(e) =>
                        handleChange(job.id, "company", e.target.value)
                      }
                      size="small"
                      fullWidth
                      sx={{ mb: 1.5 }}
                    />
                    <TextField
                      label="Role"
                      value={editedData[job.id]?.role ?? job.role}
                      onChange={(e) =>
                        handleChange(job.id, "role", e.target.value)
                      }
                      size="small"
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Date Applied"
                      type="date"
                      value={editedData[job.id]?.date ?? job.date}
                      onChange={(e) =>
                        handleChange(job.id, "date", e.target.value)
                      }
                      size="small"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 1.5 }}
                    />
                    <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                      <Select
                        value={editedData[job.id]?.status ?? job.status}
                        onChange={(e) =>
                          handleChange(job.id, "status", e.target.value)
                        }
                      >
                        <MenuItem value="Applied">Applied</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Waiting">Waiting</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                      </Select>
                    </FormControl>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ ml: 1, alignContent: "flex-end" }}
                      >
                        Last Updated:{" "}
                        {job.lastUpdated ? formatDate(job.lastUpdated) : "N/A"}
                      </Typography>
                      <IconButton
                        color="primary"
                        onClick={() => handleSave(job.id)}
                        // Enabled only when unsaved changes exist and not currently saving
                        disabled={
                          !editedData[job.id] || saving[job.id] === "loading"
                        }
                      >
                        {saving[job.id] === "loading" ? (
                          <CircularProgress size={22} color="inherit" />
                        ) : (
                          <Check />
                        )}
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(job.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Paper>
                ))
              ) : (
                <Typography align="center">No jobs found.</Typography>
              )}
            </FlipMove>
          </Box>
        ) : (
          // Desktop view: Render table without sorting controls
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              maxHeight: "60vh",
              border: 2,
              borderColor: theme.palette.divider,
              borderRadius: 2,
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Company</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Date Applied</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <FlipMove typeName="tbody">
                {sortedJobs.length > 0 ? (
                  sortedJobs.map((job) => (
                    <TableRow
                      key={job.id}
                      hover
                      sx={{
                        // Apply the unsaved animation style if needed
                        ...(editedData[job.id] && unsavedStyle),
                      }}
                    >
                      <TableCell>
                        <TextField
                          value={editedData[job.id]?.company ?? job.company}
                          onChange={(e) =>
                            handleChange(job.id, "company", e.target.value)
                          }
                          size="small"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={editedData[job.id]?.role ?? job.role}
                          onChange={(e) =>
                            handleChange(job.id, "role", e.target.value)
                          }
                          size="small"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="date"
                          value={editedData[job.id]?.date ?? job.date}
                          onChange={(e) =>
                            handleChange(job.id, "date", e.target.value)
                          }
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={editedData[job.id]?.status ?? job.status}
                            onChange={(e) =>
                              handleChange(job.id, "status", e.target.value)
                            }
                          >
                            <MenuItem value="Applied">Applied</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Waiting">Waiting</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {job.lastUpdated ? formatDate(job.lastUpdated) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleSave(job.id)}
                            disabled={
                              !editedData[job.id] ||
                              saving[job.id] === "loading"
                            }
                          >
                            {saving[job.id] === "loading" ? (
                              <CircularProgress size={22} color="inherit" />
                            ) : (
                              <Check />
                            )}
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(job.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No jobs found.
                    </TableCell>
                  </TableRow>
                )}
              </FlipMove>
            </Table>
          </TableContainer>
        )}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Fab color="primary" onClick={handleAddJob}>
            <Add />
          </Fab>
        </Box>
      </Box>
    </Box>
  );
};

export default JobList;
