"use client";

import React from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ArrowForwardIosSharp } from "@mui/icons-material";
import Link from "next/link";
import { useCookies } from "react-cookie";
import Image from "next/image";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const [cookies, removeCookie] = useCookies();

  const handleLogout = () => {
    // Remove all cookies
    Object.keys(cookies).forEach((cookieName) => {
      removeCookie(cookieName, { path: "/" });
    });

    // Optionally: redirect to login or home page
    // router.push("/login") if using `useRouter` from Next.js
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250, padding: 2 }} role="presentation">
        <Typography variant="h6" gutterBottom>
          AICarAdvisor
        </Typography>
        <Button
          variant="contained"
          style={{ backgroundColor: "rgb(198, 220, 248)" }}
        >
          <span>
            <Image
              src="/assets/chat-dots.svg"
              alt="chatIcon"
              width={24}
              height={24}
              style={{ color: "rgb(0, 98, 238)" }}
            />
          </span>
          <span
            style={{
              color: "rgb(0, 98, 238)",
              textTransform: "capitalize",
              fontWeight: 700,
            }}
          >
            New Chat
          </span>
        </Button>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            padding: "10px",
            marginTop: "20px",
          }}
        >
          <Accordion
            style={{ backgroundColor: "rgba(238, 238, 239, 1)", height: "60%" }}
          >
            <AccordionSummary
              expandIcon={<ArrowForwardIosSharp />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography component="span" style={{ fontWeight: "bolder" }}>
                Reveal More
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div>
                <ul
                  className="menu"
                  style={{
                    backgroundColor: "rgba(238, 238, 239, 1)",
                    listStyle: "none",
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <li>
                    <Link href="/about">
                      <span>
                        <Image
                          src="/assets/info-circle-fill.svg"
                          alt="info"
                          height={13}
                          width={13}
                        />
                      </span>
                      <span style={{ fontSize: "13px" }}>About</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/notificationContainer">
                      <span>
                        <Image
                          src="/assets/bell-fill.svg"
                          alt="bell"
                          height={13}
                          width={13}
                        />
                      </span>
                      <span style={{ fontSize: "13px" }}>All Notification</span>
                    </Link>
                  </li>
                  <li onClick={handleLogout}>
                    <span style={{ marginLeft: "16px" }}>
                      <Image
                        src="/assets/box-arrow-right.svg"
                        alt="arrow"
                        height={13}
                        width={13}
                      />
                    </span>
                    <span style={{ fontSize: "13px" }}>Logout</span>
                  </li>
                </ul>
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
