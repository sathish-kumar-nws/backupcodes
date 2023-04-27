import React, { useRef, useState } from "react";
import SchoolTwoToneIcon from "@mui/icons-material/SchoolTwoTone";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
  Container,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Grid,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { pink } from "@mui/material/colors";
import styled from "@emotion/styled";
import AddBoxIcon from "@mui/icons-material/AddBox";
import axios from "axios";
import { AlertColor } from "@mui/material/Alert";
import Slide, { SlideProps } from "@mui/material/Slide";

const StyledDeleteIcon = styled(DeleteIcon)`
  color: pink[500];
  transition: transform 0.3s ease-out;

  &:hover {
    transform: scale(1.2);
  }
`;

//for SEMESTER COURSES DETAILS
interface Row {
  id: number;
  Course: string;
  Specialization: string;
  semesterNos: number | undefined;
  Eligibility: string;
  tuitionFee: number | undefined;
  otherFee: number | undefined;
  totalFee: number | undefined;
  status: string;
}

// For YEARLY COURSES DETAILS
interface Row2 {
  id2: number;
  Course: string;
  Specialization: string;
  NoOfYear: number | undefined;
  Eligibility: string;
  tuitionFee: number | undefined;
  otherFee: number | undefined;
  totalFee: number | undefined;
  status: string;
}

//for SEMESTER COURSES DETAILS
const initialRows: Row[] = [
  {
    id: 1,
    Course: "",
    Specialization: "",
    semesterNos: undefined,
    // NoOfYear: undefined,
    Eligibility: "",
    tuitionFee: undefined,
    otherFee: undefined,
    totalFee: undefined,
    status: "",
  },
];

// For YEARLY COURSES DETAILS
const initialRows2: Row2[] = [
  {
    id2: 1,
    Course: "",
    Specialization: "",
    NoOfYear: undefined,
    Eligibility: "",
    tuitionFee: undefined,
    otherFee: undefined,
    totalFee: undefined,
    status: "",
  },
];

const AddForm: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [rows, setRows] = useState(initialRows);
  const [rows2, setRows2] = useState(initialRows2);
  const [universityName, setUniversityName] = useState({ university: "" });
  const [universityStatus, setuniversityStatus] = useState({
    universityStatusinput: "",
  });
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState<AlertColor | undefined>(undefined);
  const [message, setMessage] = useState("");

  //to handle add rows button to include rows in the form
  const handleAddRow = (type: "semester" | "yearly") => {
    const newId = type === "semester" ? rows.length + 1 : rows2.length + 1;
    if (type === "semester") {
      setRows([
        ...rows,
        {
          id: newId,
          Course: "",
          Specialization: "",
          semesterNos: undefined,
          Eligibility: "",
          tuitionFee: undefined,
          otherFee: undefined,
          totalFee: undefined,
          status: "",
        },
      ]);
    } else if (type === "yearly") {
      setRows2([
        ...rows2,
        {
          id2: newId,
          Course: "",
          Specialization: "",
          NoOfYear: undefined,
          Eligibility: "",
          tuitionFee: undefined,
          otherFee: undefined,
          totalFee: undefined,
          status: "",
        },
      ]);
    }
  };

  //to handle delete rows in the form
  const handleDeleteRow = (id: number, type: string) => {
    const confirmation = window.confirm("Are you sure you want to delete?");
    if (id === 1) {
      return; // Don't delete the first row
    }
    if (confirmation) {
      if (type === "semester") {
        const newRows = rows.filter((row) => row.id !== id);
        setRows(newRows);
      } else if (type === "yearly") {
        const newRows = rows2.filter((row2) => row2.id2 !== id);
        setRows2(newRows);
      }
    }
  };

  //to handle input change
  const handleInputChange = (
    id: number,
    field: string,
    value: string | number,
    type: string
  ) => {
    let newRows;
    if (type === "semester") {
      newRows = rows.map((row) => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      });
      setRows(newRows);
    } else if (type === "yearly") {
      newRows = rows2.map((row2) => {
        if (row2.id2 === id) {
          return { ...row2, [field]: value };
        }
        return row2;
      });
      setRows2(newRows);
    }
  };

  //form submissin to post data to backend
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // to include the submitted Date & Time
    const timestamp = new Date();
    const dateStr = timestamp.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      timeZone: "Asia/Kolkata", // add time zone
    });
    const timeStr = timestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Kolkata", // add time zone
    });
    const formattedTimestamp = `${dateStr} ${timeStr}`;

    console.log(
      "Form submitted with rows:",
      universityName,
      rows,
      rows2,
      universityStatus,
      timestamp,
      formattedTimestamp
    );

    const universities = await axios.get("http://localhost:4001/universities");

    const existingUniversity = universities.data.filter(
      (uni: any) => uni.university === universityName.university
    );

    if (existingUniversity.length > 0) {
      setOpen(true);
      setSeverity("error");
      setMessage("University already exists");
      return;
    }

    try {
      const response = await axios.post("http://localhost:4001/adduniversity", {
        universityName,
        rows,
        rows2,
        universityStatus,
        timestamp,
        formattedTimestamp,
      });
      console.log(response.data);
      setOpen(true);
      setSeverity("success");
      setMessage("University added successfully");
    } catch (error: any) {
      console.log(error);
      setOpen(true);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setSeverity("error");
        setMessage(error.response.data.message);
      } else {
        setSeverity("error");
        setMessage("Failed to add university");
      }
    } finally {
      formRef.current?.reset();
      setRows(initialRows);
      setRows2(initialRows2);
      setUniversityName({ university: "" });
      setuniversityStatus({ universityStatusinput: "" });
    }
  };

  //to handle cloe button in the submiited message popup
  const handleClose = () => {
    setOpen(false);
    setMessage("");
    setSeverity(undefined);
  };

  return (
    <Container component={Paper} sx={{ mt: 2, mb: 2, p: 2, boxShadow: 5 }}>
      {/* //successul submisson message */}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" } as SlideProps}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>

      <Grid component="form" onSubmit={handleSubmit} sx={{ p: 1 }}>
        {/* add university header part   */}
        <Typography variant="h5" color="primary" sx={{ fontWeight: 400 }}>
          ADD UNIVERSITY
        </Typography>

        {/* University Name */}
        <Box sx={{ width: "100%" }}>
          <FormControl variant="outlined" size="small" fullWidth sx={{ mt: 2 }}>
            <InputLabel htmlFor="University-name-input">
              University Name
            </InputLabel>
            <OutlinedInput
              id="University-name-input"
              required
              startAdornment={
                <InputAdornment position="start">
                  <SchoolTwoToneIcon color="primary" />
                </InputAdornment>
              }
              value={universityName.university}
              onChange={(e) =>
                setUniversityName({ university: e.target.value })
              }
              label="University Name"
            />
          </FormControl>
        </Box>

        {/* SEMESTER COURSES DETAILS */}
        <Box sx={{ width: "100%" }} marginTop={2}>
          <Grid
            marginBottom={2}
            container
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography variant="button" textAlign="left" color="primary">
                Semester Courses Details
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                onClick={() => handleAddRow("semester")}
                startIcon={<AddBoxIcon />}
                size="small"
              >
                Add Row
              </Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell colSpan={2}>
                      <FormControl
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ m: 1 }}
                      >
                        <InputLabel htmlFor="Course-fee-input">
                          Course Name
                        </InputLabel>
                        <OutlinedInput
                          id="Course-fee-input"
                          required
                          startAdornment={
                            <InputAdornment position="start"> </InputAdornment>
                          }
                          value={row.Course}
                          onChange={(e) =>
                            handleInputChange(
                              row.id,
                              "Course",
                              e.target.value,
                              "semester"
                            )
                          }
                          label="Course Name"
                        />
                      </FormControl>
                    </TableCell>

                    <TableCell colSpan={2}>
                      <FormControl
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ m: 1 }}
                      >
                        <InputLabel htmlFor="Specialization-fee-input">
                          Specialization
                        </InputLabel>
                        <OutlinedInput
                          required
                          id="Course-fee-input"
                          startAdornment={
                            <InputAdornment position="start"> </InputAdornment>
                          }
                          // type="number"
                          value={row.Specialization}
                          onChange={(e) =>
                            handleInputChange(
                              row.id,
                              "Specialization",
                              e.target.value,
                              "semester"
                            )
                          }
                          label="Specialization"
                        />
                      </FormControl>
                    </TableCell>

                    <TableCell colSpan={6}>
                      <TableCell>
                        <FormControl
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{ m: 1, width: "95px" }}
                        >
                          <InputLabel htmlFor="semesters-fee-input">
                            Semesters
                          </InputLabel>
                          <OutlinedInput
                            required
                            id="semesters-fee-input"
                            startAdornment={
                              <InputAdornment position="start">
                                {" "}
                              </InputAdornment>
                            }
                            type="number"
                            value={row.semesterNos}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "semesterNos",
                                e.target.value,
                                "semester"
                              )
                            }
                            label="No.Of semesters"
                          />
                        </FormControl>
                      </TableCell>

                      <TableCell>
                        <FormControl
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{ m: 1 }}
                        >
                          <InputLabel htmlFor="Eligibility-fee-input">
                            Eligibility
                          </InputLabel>
                          <OutlinedInput
                            required
                            id="Eligibility-fee-input"
                            startAdornment={
                              <InputAdornment position="start">
                                {" "}
                              </InputAdornment>
                            }
                            value={row.Eligibility}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "Eligibility",
                                e.target.value,
                                "semester"
                              )
                            }
                            label="Eligibility"
                          />
                        </FormControl>
                      </TableCell>

                      <TableCell>
                        <FormControl
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{ m: 1 }}
                        >
                          <InputLabel htmlFor="tuition-fee-input">
                            Tuition Fee
                          </InputLabel>
                          <OutlinedInput
                            required
                            id="tuition-fee-input"
                            startAdornment={
                              <InputAdornment position="start">
                                ₹
                              </InputAdornment>
                            }
                            type="number"
                            value={row.tuitionFee}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "tuitionFee",
                                e.target.value,
                                "semester"
                              )
                            }
                            label="Tuition Fee"
                          />
                        </FormControl>
                      </TableCell>

                      <TableCell>
                        <FormControl
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{ m: 1 }}
                        >
                          <InputLabel htmlFor="otherFee-fee-input">
                            Other Fee
                          </InputLabel>
                          <OutlinedInput
                            required
                            id="otherFee-fee-input"
                            startAdornment={
                              <InputAdornment position="start">
                                ₹
                              </InputAdornment>
                            }
                            type="number"
                            value={row.otherFee}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "otherFee",
                                e.target.value,
                                "semester"
                              )
                            }
                            label="Other Fee"
                          />
                        </FormControl>
                      </TableCell>

                      <TableCell>
                        <FormControl
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{ m: 1 }}
                        >
                          <InputLabel htmlFor="totalFee-fee-input">
                            Total Fee
                          </InputLabel>
                          <OutlinedInput
                            required
                            id="totalFee-fee-input"
                            startAdornment={
                              <InputAdornment position="start">
                                ₹
                              </InputAdornment>
                            }
                            type="number"
                            value={row.totalFee}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "totalFee",
                                e.target.value,
                                "semester"
                              )
                            }
                            label="totalFee"
                          />
                        </FormControl>
                      </TableCell>

                      <TableCell>
                        <FormControl
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{ m: 1 }}
                        >
                          <InputLabel htmlFor="status-fee-input">
                            Status
                          </InputLabel>
                          <Select
                            required
                            id="status-fee-input"
                            startAdornment={
                              <InputAdornment position="start">
                                {" "}
                              </InputAdornment>
                            }
                            value={row.status}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "status",
                                e.target.value,
                                "semester"
                              )
                            }
                            label="Status"
                          >
                            <MenuItem value="" disabled>
                              Select
                            </MenuItem>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>

                      <TableCell>
                        {row.id > 1 && (
                          <StyledDeleteIcon
                            sx={{ color: pink[500] }}
                            onClick={() => handleDeleteRow(row.id, "semester")}
                          />
                        )}
                      </TableCell>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* YEARLY COURSES DETAILS */}
        <Box sx={{ width: "100%" }} marginTop={2}>
          <Grid
            marginBottom={2}
            container
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography variant="button" textAlign="left" color="primary">
                Yearly Courses Details
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                onClick={() => handleAddRow("yearly")}
                startIcon={<AddBoxIcon />}
                size="small"
              >
                Add Row
              </Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {rows2.map((row2) => (
                  <TableRow key={row2.id2}>
                    <TableCell>
                      <FormControl
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ m: 1 }}
                      >
                        <InputLabel htmlFor="Course-fee-input">
                          Course Name
                        </InputLabel>
                        <OutlinedInput
                          id="Course-fee-input"
                          required
                          startAdornment={
                            <InputAdornment position="start"> </InputAdornment>
                          }
                          value={row2.Course}
                          onChange={(e) =>
                            handleInputChange(
                              row2.id2,
                              "Course",
                              e.target.value,
                              "yearly"
                            )
                          }
                          label="Course Name"
                        />
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      <FormControl
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ m: 1 }}
                      >
                        <InputLabel htmlFor="Specialization-fee-input">
                          Specialization
                        </InputLabel>
                        <OutlinedInput
                          required
                          id="Course-fee-input"
                          startAdornment={
                            <InputAdornment position="start"> </InputAdornment>
                          }
                          value={row2.Specialization}
                          onChange={(e) =>
                            handleInputChange(
                              row2.id2,
                              "Specialization",
                              e.target.value,
                              "yearly"
                            )
                          }
                          label="Specialization"
                        />
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      <FormControl
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ m: 1, width: "95px" }}
                      >
                        <InputLabel htmlFor="NoOfYear-fee-input">
                          No.Of Year
                        </InputLabel>
                        <OutlinedInput
                          required
                          id="NoOfYear-fee-input"
                          startAdornment={
                            <InputAdornment position="start"> </InputAdornment>
                          }
                          type="number"
                          value={row2.NoOfYear}
                          onChange={(e) =>
                            handleInputChange(
                              row2.id2,
                              "NoOfYear",
                              e.target.value,
                              "yearly"
                            )
                          }
                          label="No.Of semesters"
                        />
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      <FormControl
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ m: 1 }}
                      >
                        <InputLabel htmlFor="Eligibility-fee-input">
                          Eligibility
                        </InputLabel>
                        <OutlinedInput
                          required
                          id="Eligibility-fee-input"
                          startAdornment={
                            <InputAdornment position="start"> </InputAdornment>
                          }
                          value={row2.Eligibility}
                          onChange={(e) =>
                            handleInputChange(
                              row2.id2,
                              "Eligibility",
                              e.target.value,
                              "yearly"
                            )
                          }
                          label="Eligibility"
                        />
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      <FormControl
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ m: 1 }}
                      >
                        <InputLabel htmlFor="tuition-fee-input">
                          Tuition Fee
                        </InputLabel>
                        <OutlinedInput
                          required
                          id="tuition-fee-input"
                          startAdornment={
                            <InputAdornment position="start">₹</InputAdornment>
                          }
                          type="number"
                          value={row2.tuitionFee}
                          onChange={(e) =>
                            handleInputChange(
                              row2.id2,
                              "tuitionFee",
                              e.target.value,
                              "yearly"
                            )
                          }
                          label="Tuition Fee"
                        />
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      <FormControl
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ m: 1 }}
                      >
                        <InputLabel htmlFor="otherFee-fee-input">
                          Other Fee
                        </InputLabel>
                        <OutlinedInput
                          required
                          id="otherFee-fee-input"
                          startAdornment={
                            <InputAdornment position="start">₹</InputAdornment>
                          }
                          type="number"
                          value={row2.otherFee}
                          onChange={(e) =>
                            handleInputChange(
                              row2.id2,
                              "otherFee",
                              e.target.value,
                              "yearly"
                            )
                          }
                          label="Other Fee"
                        />
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      <FormControl
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ m: 1 }}
                      >
                        <InputLabel htmlFor="totalFee-fee-input">
                          Total Fee
                        </InputLabel>
                        <OutlinedInput
                          required
                          id="totalFee-fee-input"
                          startAdornment={
                            <InputAdornment position="start">₹</InputAdornment>
                          }
                          type="number"
                          value={row2.totalFee}
                          onChange={(e) =>
                            handleInputChange(
                              row2.id2,
                              "totalFee",
                              e.target.value,
                              "yearly"
                            )
                          }
                          label="totalFee"
                        />
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      <FormControl
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ m: 1 }}
                      >
                        <InputLabel htmlFor="status-fee-input">
                          Status
                        </InputLabel>
                        <Select
                          required
                          id="status-fee-input"
                          startAdornment={
                            <InputAdornment position="start"> </InputAdornment>
                          }
                          value={row2.status}
                          onChange={(e) =>
                            handleInputChange(
                              row2.id2,
                              "status",
                              e.target.value,
                              "yearly"
                            )
                          }
                          label="Status"
                        >
                          <MenuItem value="" disabled>
                            Select
                          </MenuItem>
                          <MenuItem value="Active">Active</MenuItem>
                          <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      {row2.id2 > 1 && (
                        <StyledDeleteIcon
                          sx={{ color: pink[500] }}
                          onClick={() => handleDeleteRow(row2.id2, "yearly")}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* University Status */}
        <Box sx={{ width: "100%" }} marginTop={3}>
          <FormControl variant="outlined" size="small" fullWidth sx={{ mb: 2 }}>
            <InputLabel htmlFor="UniversityStatus-fee-input">
              University Status
            </InputLabel>
            <Select
              required
              id="UniversityStatus-fee-input"
              startAdornment={
                <InputAdornment position="start"></InputAdornment>
              }
              value={universityStatus.universityStatusinput}
              onChange={(e) =>
                setuniversityStatus({ universityStatusinput: e.target.value })
              }
              label="University Status"
              style={{ textAlign: "left" }}
            >
              <MenuItem value="" disabled>
                Select University Status
              </MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* submit button */}
        <Button variant="contained" color="primary" type="submit">
          Submit
        </Button>
      </Grid>
    </Container>
  );
};

export default AddForm;
