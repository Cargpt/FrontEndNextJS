"use client";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ArrowBackIosNew, KeyboardBackspaceSharp } from "@mui/icons-material";
import { Box, Breadcrumbs, IconButton } from "@mui/material";
import { grey } from "@mui/material/colors";

interface ProfileData {
  firstName: string;
  lastName: string;
  mobile: string;
  profilePic?: string;
}

const defaultProfile: ProfileData = {
  firstName: "",
  lastName: "",
  mobile: "",
  profilePic: "",
};

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [cookies] = useCookies(["user"]);
  const router = useRouter();

  useEffect(() => {
    if (cookies.user) {
      const profile = {
        firstName: cookies.user?.first_name,
        lastName: cookies.user?.last_name,
        mobile: cookies?.user?.mobile_no_read,
        profilePic: "",
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

  const handleBack = () => {
    router.back(); // Go back to previous page
  };

  return (
    <>
     <Box sx={{ p: 1, minWidth:"100%", mt:1,}}>
      {/* Breadcrumb with just back icon */}
      <Box sx={{ width: "100%",  }}>
        <Breadcrumbs aria-label="breadcrumb">
          <IconButton
            onClick={() => router.back()}
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
      </Box>
    <div style={styles.container}>
      {/* Back Button */}


      <h2>Profile Page</h2>

      <div style={styles.profilePicContainer}>
        <label htmlFor="profilePicInput">
          {profile.profilePic ? (
            <img
              src={profile.profilePic}
              alt="Profile"
              style={styles.profilePic}
            />
          ) : (
            <div style={styles.placeholderIcon}>👤</div>
          )}
        </label>
        <input
          id="profilePicInput"
          type="file"
          accept="image/*"
          onChange={handleProfilePicChange}
          style={{ display: "none" }}
        />
      </div>

      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={profile.firstName}
        onChange={handleInputChange}
        style={styles.input}
      />

      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={profile.lastName}
        onChange={handleInputChange}
        style={styles.input}
      />

      <input
        type="tel"
        name="mobile"
        placeholder="Mobile Number"
        value={profile.mobile}
        onChange={handleInputChange}
        style={styles.input}
        readOnly
      />
    </div>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "300px",
    margin: "2rem auto",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
    fontFamily: "sans-serif",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    background: "none",
    border: "none",
    color: "#0062ee",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: 14,
    fontWeight: 600,
  },
  profilePicContainer: {
    marginBottom: "1rem",
    cursor: "pointer",
  },
  profilePic: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  placeholderIcon: {
    fontSize: "64px",
    color: "#888",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "0.5rem",
    marginBottom: "0.75rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
};

export default ProfilePage;
