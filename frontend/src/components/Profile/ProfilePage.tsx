"use client";

import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import {
  Box,
  Breadcrumbs,
  IconButton,
  Avatar,
  Typography,
  TextField,
  Tooltip,
  Badge,
} from "@mui/material";
import KeyboardBackspaceSharp from "@mui/icons-material/KeyboardBackspaceSharp";
import { PhotoCamera } from "@mui/icons-material";

interface ProfileData {
  firstName: string;
  lastName: string;
  mobile_no: string;
  profilePic?: string;
}

const defaultProfile: ProfileData = {
  firstName: "",
  lastName: "",
  mobile_no: "",
  profilePic: "",
};

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [cookies] = useCookies(["user"]);
  const router = useRouter();

  useEffect(() => {
    if (cookies.user) {
      const profile = {
        firstName: cookies.user?.first_name || "",
        lastName: cookies.user?.last_name || "",
        mobile_no: cookies?.user?.mobile_no_read || cookies?.user?.mobile_no || "",
        profilePic: cookies.user?.photo || "",
      };
      setProfile(profile);
    }
  }, [cookies.user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setProfile((prev) => ({
          ...prev,
          profilePic: fileReader.result as string,
        }));
      };
      fileReader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleBack = () => router.back();

  return (
    <>
      {/* Top Breadcrumb / Back Button */}
      <Box sx={{ p: 1, minWidth: "100%", mt: 1 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <IconButton
            onClick={handleBack}
            sx={{
              padding: 0.5,
              borderRadius: 1,
              backgroundColor: "transparent",
            }}
          >
            <KeyboardBackspaceSharp fontSize="small" />
          </IconButton>
        </Breadcrumbs>
      </Box>

      {/* Profile Form */}
      <Box
        sx={{
          width: 300,
          mx: "auto",
          p: 2,
          mt: 2,
          border: "1px solid #ccc",
          borderRadius: 2,
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Profile Page
        </Typography>

        {/* Profile Picture */}
{/* Profile Picture with Camera Icon */}
<Box sx={{ mb: 2 }}>
  <input
    id="profilePicInput"
    type="file"
    accept="image/*"
    onChange={handleProfilePicChange}
    style={{ display: "none" }}
  />
  <label htmlFor="profilePicInput" style={{ cursor: "pointer" }}>
    <Tooltip title="Click to change profile photo">
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={
          <PhotoCamera
            sx={{
              backgroundColor: "#fff",
              borderRadius: "50%",
              padding: "4px",
              fontSize: "18px",
              boxShadow: "0 0 3px rgba(0,0,0,0.2)",
            }}
          />
        }
      >
        <Avatar
          src={profile.profilePic}
          sx={{
            width: 72,
            height: 72,
            mx: "auto",
            border: "2px solid #ccc",
            "&:hover": { opacity: 0.85 },
          }}
        >
          {!profile.profilePic && "👤"}
        </Avatar>
      </Badge>
    </Tooltip>
  </label>
</Box>


        {/* First Name */}
        <TextField
          fullWidth
          label="First Name"
          name="firstName"
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          value={profile.firstName}
          onChange={handleInputChange}
        />

        {/* Last Name */}
        <TextField
          fullWidth
          label="Last Name"
          name="lastName"
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          value={profile.lastName}
          onChange={handleInputChange}
        />

        {/* Mobile Number (read-only) */}
        <TextField
          fullWidth
          label="Mobile Number"
          name="mobile_no"
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          value={profile.mobile_no}
          InputProps={{
            readOnly: true,
          }}
        />
      </Box>
    </>
  );
};

export default ProfilePage;
