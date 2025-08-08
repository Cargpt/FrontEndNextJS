"use client";

import { useState } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import { useRouter } from "next/navigation";

const BottomNavigationBar: React.FC = () => {
  const [value, setValue] = useState<number>(0);
  const router = useRouter();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    switch (newValue) {
      case 0:
        router.push("/");
        break;
      case 1:
        router.push("/login");
        break;
      case 2:
        router.push("/more");
        break;
      default:
        break;
    }
  };

  return (
    <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation value={value} onChange={handleChange} showLabels>
        <BottomNavigationAction label="Home" icon={<HomeOutlinedIcon />} />
        <BottomNavigationAction label="Login" icon={<LoginOutlinedIcon />} />
        <BottomNavigationAction label="More" icon={<MoreHorizOutlinedIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNavigationBar;
