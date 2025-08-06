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
  useTheme,
} from "@mui/material";
import { ArrowForwardIosSharp, InfoOutline, NotificationAddOutlined } from "@mui/icons-material";
import Link from "next/link";
import { useCookies } from "react-cookie";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import LoginDialog from "../common/Dialogs/LoginDialog";
import { useSnackbar } from "@/Context/SnackbarContext";
import { useLoginDialog } from "@/Context/LoginDialogContextType";
import SignupDialog from "../Auth/SignupDialog";
import HomeIcon from "@mui/icons-material/Home";
import { useRouter } from "next/navigation";
import  { useMemo } from 'react';
import { ThemeProvider, CssBaseline, createTheme, } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const [cookies, , removeCookie] = useCookies(["token", "user"]);
    const [mode, setMode] = useState<'light' | 'dark'>('light');

const router =useRouter()
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    if (cookies.user) {
      const storedChats = JSON.parse(localStorage.getItem('chats') || '[]');
      setChats(storedChats);
    } else {
      setChats([]);
    }
  }, [cookies.user]);

  useEffect(() => {}, [cookies.token]);

  const handleLogout = () => {
    removeCookie("user", { path: "/" });
    router.push("/")
    onClose();
  };

  const { showSnackbar } = useSnackbar();
  const { open: openLoginDialoge, hide, show } = useLoginDialog();

  const [showSignUpState, setshowSignUpState] = useState<boolean>(false);
const theme=useTheme()
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
                  <AccountCircleOutlinedIcon color="primary" sx={{fontSize:"2rem"}}/>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
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
                    color: theme.palette.text.primary ,
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
                    marginTop: 1,
                    marginBottom: 20,
                    padding: "2px 8px",
                    borderRadius: 8,
                    transition: "background 0.2s",
                    paddingTop:"0px"
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#e3eaf6")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <img 
                  loading="lazy"
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
                      color: theme.palette.text.primary,
                    }}
                  >
                    Booked test drive
                  </Typography>
                </a>
              </Link>
            )}
          </div>
           
          
            {/* History link styled simply */}
            {/* Remove the History link section */}

            {/* Profile and other links */}
            {cookies.user && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, fontWeight: 600, mb: 1, ml: 1 }}>
                  Chats
                </Typography>
                <Box sx={{
                  display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflowY: 'auto', mb: 2, px: 1
                }}>
                  {chats.length === 0 ? (
                    <Typography variant="body2" sx={{ color: theme.palette.text.disabled, ml: 1 }}>
                      No chats yet.
                    </Typography>
                  ) : (
                    chats.map((chat, idx) => {
                      const filterSummary = chat.filter
                        ? Object.entries(chat.filter)
                            .filter(([key]) => key !== 'brands') // Exclude brands array
                            .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
                            .join(', ')
                        : '';

                      return (
                        <Link key={idx} href={`/chats/${chat.id || idx}`} passHref legacyBehavior>
                          <a
                            onClick={onClose}
                            style={{
                              display: 'flex',
                              flexDirection: 'column', // Change to column to stack title and summary
                              alignItems: 'flex-start',
                              padding: '8px 10px',
                              borderRadius: 8,
                              background: theme.palette.mode === 'dark' ? theme.palette.background.default : '#f5f5f5',
                              marginBottom: 4,
                              textDecoration: 'none',
                              color: theme.palette.text.primary,
                              fontWeight: 500,
                              fontSize: 15,
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                            }}
                            onMouseOver={e => (e.currentTarget.style.background = theme.palette.action.hover)}
                            onMouseOut={e => (e.currentTarget.style.background = theme.palette.mode === 'dark' ? theme.palette.background.default : '#f5f5f5')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <HistoryOutlinedIcon sx={{ fontSize: 18, marginRight: 1, color: theme.palette.text.secondary }} />
                              <Typography component="span" sx={{ fontSize: 15, fontWeight: 600 }}>
                                {chat.title || chat.type || 'Chat'}
                              </Typography>
                            </Box>
                            {filterSummary && (
                              <Typography variant="caption" sx={{ fontSize: 12, color: theme.palette.text.secondary, ml: '26px' }}> {/* Indent to align with title text */}
                                {filterSummary}
                              </Typography>
                            )}
                          </a>
                        </Link>
                      );
                    })
                  )}
                </Box>
              </Box>
            )}


          <Box sx={{ width: "100%", mt: "auto" }}>
            <Accordion
              sx={{
                backgroundColor: theme.palette.background.paper,
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
                    color: theme.palette.text.primary,
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
                          fontSize: 14,
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                        }}
                      >
                        <span>
                                                                          <InfoOutline sx={{width:15, height:15}}/>

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
                          color: theme.palette.text.primary,
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        <span>
                                                <NotificationAddOutlined sx={{width:15, height:15}}/>

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
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        transition: "background 0.2s",
                      }}
                      
                    >
                      <span role="button">
                       <LoginOutlinedIcon sx={{width:15, height:15}}/>
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
