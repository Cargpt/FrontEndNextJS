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
import { Photo, PhotoCamera } from "@mui/icons-material";
import { axiosInstance1 } from "@/utils/axiosInstance";
import FixedHeaderWithBack from "../Navbar/Navbar";
import { Capacitor } from "@capacitor/core";

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
  const [cookies , setCookie] = useCookies(["user"]);
  const router = useRouter();

  const fetchProfileDetails = async () => {
    try {
      // Get token from cookies - check root level first since that's where it's stored
      let token = (cookies as any).token;
      
      if (!token) {
        // Fallback to user object if needed
        token = cookies.user?.token;
      }
      
      if (!token) {
        console.error("No authentication token found in cookies");
        return;
      }
      
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      
      const response = await fetch(`${baseURL}/api/cargpt/profile-detail/`, {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the profile state
        setProfile({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          mobile_no: data.mobile_no_read || data.mobile_no || "",
          profilePic: data.photo || "",
        });
        
        // Save the complete profile data to cookies for future use
        // Keep the same field names as the API response for consistency
        setCookie("user", {
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          mobile_no: data.mobile_no_read || data.mobile_no || "",
          photo: data.photo || "",
        }, { 
          path: "/", 
          maxAge: 60 * 60 * 24 * 365 // 1 year
        });
      } else {
        console.error("Failed to fetch profile details:", response.status, response.statusText);
      }
    } catch (error: any) {
      console.error("Error fetching profile details:", error);
    }
  };

  // Empty dependency array means this runs once on mount

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
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleBack = () => router.back();

  const handleImageUpload = async (imageFile: File) => {
    const formData = new FormData();
    formData.append("photo", imageFile);

    try {
      // Get token from cookies - check root level first since that's where it's stored
      let token = (cookies as any).token;
      
      if (!token) {
        // Fallback to user object if needed
        token = cookies.user?.token;
      }
      
      if (!token) {
        console.error("No authentication token found in cookies for image upload");
        return;
      }
      
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      
      const headers: Record<string, string> = {
        "Authorization": `Bearer ${token}`
        // Note: Don't set Content-Type for FormData - browser will set it automatically with boundary
      };
      
      const response = await fetch(`${baseURL}/api/cargpt/upload-profile-image/`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        // Check for photo_url in the response data
        if (data && data.photo_url) {
          const newPhotoUrl = data.photo_url;
          if (newPhotoUrl) {
            // Call fetchProfileDetails to refresh the profile data
            fetchProfileDetails();
          }
        } else {
          console.error("Image upload API call failed or missing photo_url:", data);
        }
      } else {
        console.error("Failed to upload profile image:", response.status, response.statusText);
      }
    } catch (error: any) {
      console.error("Error uploading profile image:", error);
    }
  };
 useEffect(() => { 
  setProfile({
    firstName: cookies.user?.first_name || "",
    lastName: cookies.user?.last_name || "",
    mobile_no: cookies.user?.mobile_no || "",
    profilePic: cookies.user?.photo || "",
  });
 }, [cookies.user]);

 const isNative=Capacitor.isNativePlatform()
  return (
    <>
      {/* Top Breadcrumb / Back Button */}
      <FixedHeaderWithBack backToPrevious={handleBack}/>

      {/* Profile Form */}
      <Box
        sx={{
          width: 300,
          mx: "auto",
          p: 2,
          pt: isNative ? "56px":"10px",
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
