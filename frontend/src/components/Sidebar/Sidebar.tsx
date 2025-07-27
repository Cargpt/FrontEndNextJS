"use client";

import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
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
  const [cookies, setCookie, removeCookie] = useCookies(["token", "user"]);

  useEffect(() => {
  }, [cookies.token]);

  const handleLogout = () => {
     removeCookie("user", { path: "/" });
    
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 270,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2,
          boxSizing: "border-box",
          background: "#f7f9fb",
        }}
        role="presentation"
      >
        <div>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: 800,
              color: "#0062ee",
              letterSpacing: 1,
              mb: 3,
            }}
          >
            AICarAdvisor
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#c6dcf8",
              color: "#0062ee",
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              fontWeight: 700,
              textTransform: "capitalize",
              boxShadow: "none",
              width: "100%",
              mb: 3,
              py: 1.2,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#b3d2f6",
                boxShadow: "0 2px 8px 0 rgba(0,98,238,0.08)",
              },
            }}
          >
            <span>
              <Image
                src="/assets/chat-dots.svg"
                alt="chatIcon"
                width={24}
                height={24}
                style={{ color: "#0062ee" }}
              />
            </span>
            <span>New Chat</span>
          </Button>
        </div>
        <Box sx={{ width: "100%", mt: "auto" }}>
          <Accordion
            sx={{
              backgroundColor: "#eef0f3",
              boxShadow: "none",
              borderRadius: 2,
              mb: 1,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={
                <ArrowForwardIosSharp
                  sx={{ fontSize: 18, color: "#0062ee" }}
                />
              }
              aria-controls="panel1-content"
              id="panel1-header"
              sx={{
                minHeight: 44,
                "& .MuiAccordionSummary-content": {
                  margin: 0,
                  alignItems: "center",
                },
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontWeight: 700,
                  color: "#222",
                  fontSize: 15,
                }}
              >
                Reveal More
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, pt: 1 }}>
              <ul
                className="menu"
                style={{
                  backgroundColor: "transparent",
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <li
                  style={{
                    borderRadius: 6,
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#e3eaf6")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Link
                    href="/about"
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      padding: "8px 10px",
                      textDecoration: "none",
                      color: "#222",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    <span>
                      <Image
                        src="/assets/info-circle-fill.svg"
                        alt="info"
                        height={15}
                        width={15}
                      />
                    </span>
                    <span>About</span>
                  </Link>
                </li>
                <li
                  style={{
                    borderRadius: 6,
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#e3eaf6")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Link
                    href="/notificationContainer"
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      padding: "8px 10px",
                      textDecoration: "none",
                      color: "#222",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    <span>
                      <Image
                        src="/assets/bell-fill.svg"
                        alt="bell"
                        height={15}
                        width={15}
                      />
                    </span>
                    <span>All Notification</span>
                  </Link>
                </li>
                {cookies.user && (
                  <li
                    onClick={handleLogout}
                    role="button"
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                      color: "#e53935",
                      fontWeight: 600,
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#fbe9e7")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span role="button">
                      <Image
                        src="/assets/box-arrow-right.svg"
                        alt="arrow"
                        height={15}
                        width={15}
                      />
                    </span>
                    <span>Logout</span>
                  </li>
                )}
              </ul>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;