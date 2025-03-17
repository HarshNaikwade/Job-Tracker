import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
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
} from "@mui/material";
import { Check, Add, Delete } from "@mui/icons-material";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useTheme } from "@mui/material/styles";

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

const JobList = () => {
  const theme = useTheme();
  const [jobs, setJobs] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    const fetchJobs = async () => {
      const querySnapshot = await getDocs(collection(db, "jobs"));
      const jobsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(jobsList);
    };

    fetchJobs();
  }, []);

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
    const newJob = {
      company: "",
      role: "",
      date: "",
      status: "Applied",
      lastUpdated: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "jobs"), newJob);
    setJobs((prevJobs) => [{ id: docRef.id, ...newJob }, ...prevJobs]);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Box
        sx={{
          width: "95%",
          maxWidth: 1000,
          padding: 3,
          borderRadius: 3,
          boxShadow: 3,
          position: "relative",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <h2 style={{ textAlign: "center" }}>Job Applications</h2>

        <TableContainer component={Paper} sx={{ maxHeight: 450 }}>
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
            <TableBody>
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <TableRow key={job.id} hover>
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
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1, // Adds spacing between buttons
                        }}
                      >
                        <IconButton
                          color="primary"
                          onClick={() => handleSave(job.id)}
                          disabled={saving[job.id] === "loading"}
                          sx={{
                            transition: "all 0.3s",
                          }}
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
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
          <Fab color="primary" onClick={handleAddJob}>
            <Add />
          </Fab>
        </Box>
      </Box>
    </Box>
  );
};

export default JobList;
