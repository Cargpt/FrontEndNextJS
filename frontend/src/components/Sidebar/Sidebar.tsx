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
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import LoginDialog from "../common/Dialogs/LoginDialog";
import { useSnackbar } from "@/Context/SnackbarContext";
import { useLoginDialog } from "@/Context/LoginDialogContextType";
import SignupDialog from "../Auth/SignupDialog";
import HomeIcon from "@mui/icons-material/Home";
import { useRouter } from "next/navigation";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const [cookies, , removeCookie] = useCookies(["token", "user"]);
const router =useRouter()
  useEffect(() => {}, [cookies.token]);

  const handleLogout = () => {
    removeCookie("user", { path: "/" });
    router.push("/")
    onClose();
  };

  const { showSnackbar } = useSnackbar();
  const { open: openLoginDialoge, hide, show } = useLoginDialog();

  const [showSignUpState, setshowSignUpState] = useState<boolean>(false);

  const showSignUP = () => {
    setshowSignUpState(true);
    hide();
  };

  const hideSignUP = () => {
    setshowSignUpState(false);
  };

  const handleLoginButton = () => {
    onClose();
    show();
  };

  return (
    <>
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#0062ee",
                mb: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  letterSpacing: 1,
                }}
              >
                AICarAdvisor
              </Typography>
              <Link href="/" passHref legacyBehavior>
                <a
                  onClick={onClose}
                  aria-label="Home"
                  style={{ cursor: "pointer", color: "#0062ee", marginTop: 5 }}
                >
                  <HomeIcon fontSize="small" />
                </a>
              </Link>
            </Box>

            {cookies.user ? (
              <Link href="/profile" passHref legacyBehavior>
                <a
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    textDecoration: "none",
                    color: "#222",
                    marginTop: 10,
                    marginBottom: 20,
                    padding: "8px 10px",
                    borderRadius: 8,
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#e3eaf6")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Image
                    src="/assets/avatar.png"
                    alt="Profile Icon"
                    width={28}
                    height={28}
                  />
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#222",
                    }}
                  >
                    {cookies.user.first_name && cookies.user.last_name
                      ? `${cookies.user.first_name} ${cookies.user.last_name}`
                      : "Your Profile"}
                  </Typography>
                </a>
              </Link>
            ) : (
              <span
                onClick={handleLoginButton}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                  color: "#222",
                  marginTop: 10,
                  marginBottom: 20,
                  padding: "8px 10px",
                  borderRadius: 8,
                  transition: "background 0.2s",
                  cursor: "pointer",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#e3eaf6")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <LoginOutlinedIcon color="primary" />
                <Typography
                  component="span"
                  sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#222",
                  }}
                >
                  Sign In
                </Typography>
              </span>
            )}

            {cookies.user && (
              <Link href="/booked-test-drive" passHref legacyBehavior>
                <a
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    textDecoration: "none",
                    color: "#222",
                    marginTop: 10,
                    marginBottom: 20,
                    padding: "8px 10px",
                    borderRadius: 8,
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#e3eaf6")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Image
                    src="/assets/test-drive.png"
                    alt="Profile Icon"
                    width={32}
                    height={32}
                  />
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#222",
                    }}
                  >
                    Booked test drive
                  </Typography>
                </a>
              </Link>
            )}
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
                  <ArrowForwardIosSharp sx={{ fontSize: 18, color: "#0062ee" }} />
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
                    <Link href="/about" passHref legacyBehavior>
                      <a
                        onClick={onClose}
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
                      </a>
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
                    <Link href="/notificationContainer" passHref legacyBehavior>
                      <a
                        onClick={onClose}
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
                      </a>
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

      <LoginDialog showSignUp={showSignUP} open={openLoginDialoge} onClose={hide} />
      <SignupDialog
        open={showSignUpState}
        onClose={hideSignUP}
        onSuccess={() => {}}
      />
    </>
  );
};

export default Sidebar;
