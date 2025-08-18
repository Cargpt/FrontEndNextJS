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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
} from "@mui/material";
import { ArrowForwardIosSharp, InfoOutline, InfoOutlined, NotificationAddOutlined, RestoreFromTrashOutlined } from "@mui/icons-material";
import Link from "next/link";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import { useCookies } from "react-cookie";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import LoginDialog from "../common/Dialogs/LoginDialog";
import { useSnackbar } from "@/Context/SnackbarContext";
import { useLoginDialog } from "@/Context/LoginDialogContextType";
import SignupDialog from "../Auth/SignupDialog";
import HomeIcon from "@mui/icons-material/Home";
import { useRouter } from "next/navigation";
import { axiosInstance1 } from "@/utils/axiosInstance";
import { useChats } from "@/Context/ChatContext";
import  { useMemo } from 'react';
import { ThemeProvider, CssBaseline, createTheme, } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { Capacitor } from "@capacitor/core";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from "@/Context/ColorModeContext";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

type HistoryItem = { id?: string; title: string; value: string };

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const [cookies, , removeCookie] = useCookies(["token", "user"]);
const {mode, toggleColorMode}=useColorMode()
const router =useRouter()
  useEffect(() => {}, [cookies.token]);

  const { setMessages } = useChats();
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [pendingDelete, setPendingDelete] = useState<HistoryItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHistories = async () => {
      try {
        setIsLoadingHistory(true);
        const response = await axiosInstance1.get("/api/cargpt/history/");
        if (!isMounted) return;
        const items: HistoryItem[] = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setHistories(items);
      } catch (e) {
        setHistories([]);
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    };
    if (!cookies.user) {
      // Not logged in; don't fetch and clear any previous items
      setHistories([]);
      return () => {
        isMounted = false;
      };
    }
    fetchHistories();
    return () => {
      isMounted = false;
    };
  }, [open, cookies.user]);

  const handleOpenHistory = (h: HistoryItem) => {
    try {
      const parsed = JSON.parse(h.value);
      if (Array.isArray(parsed)) {
        const flagged = (parsed as Message[]).map((m) => ({ ...m, fromHistory: true } as any));
        setMessages(flagged as Message[]);
      } else if (parsed && Array.isArray(parsed.messages)) {
        const flagged = (parsed.messages as Message[]).map((m: any) => ({ ...m, fromHistory: true }));
        setMessages(flagged as Message[]);
      } else {
        setMessages([
          {
            id: String(Date.now()),
            sender: "user",
            render: "text",
            message: h.title,
            fromHistory: true,
          } as any,
        ]);
      }
    } catch {
      setMessages([
        {
          id: String(Date.now()),
          sender: "user",
          render: "text",
          message: h.title,
          fromHistory: true,
        } as any,
      ]);
    }
    onClose();
    router.push("/home");
  };

  const handleDeleteHistory = async (h: HistoryItem) => {
    if (!h?.id) return;
    try {
      await axiosInstance1.delete(`/api/cargpt/history/${h.id}/`);
      setHistories((prev) => prev.filter((x) => x.id !== h.id));
      showSnackbar("History deleted successfully", {
        vertical: "bottom",
        horizontal: "center",
        color: "success",
      });
    } catch (e) {
      showSnackbar("Failed to delete history", {
        vertical: "bottom",
        horizontal: "center",
        color: "error",
      });
    }
  };

  const requestDeleteHistory = (h: HistoryItem) => {
    setPendingDelete(h);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDelete) {
      await handleDeleteHistory(pendingDelete);
    }
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const handleLogout = () => {
    removeCookie("user", { path: "/" });
    router.push("/")
    onClose();
    showSnackbar("Logged out successfully!", { vertical: "top", horizontal: "center", color: "info" });
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
  const isNative = Capacitor.isNativePlatform()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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

            {/* Histories Section (only for logged-in users) */}
            {cookies.user && histories.length > 0 && (
              <Box sx={{ mt: 1, mb: 1 }}>
                <Typography
                  component="div"
                  sx={{ fontWeight: 700, fontSize: 15, mb: 0.5, color: theme.palette.text.primary }}
                >
                  Histories
                </Typography>
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {histories.map((h, idx) => (
                    <li key={h.id ?? idx}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          padding: "2px 2px",
                        }}
                      >
                        <button
                          onClick={() => handleOpenHistory(h)}
                          style={{
                            flex: 1,
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            padding: "6px 8px",
                            borderRadius: 6,
                            cursor: "pointer",
                            color: theme.palette.text.primary,
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                          onMouseOver={(e) =>
                            ((e.currentTarget.style.background = "#e3eaf6"))
                          }
                          onMouseOut={(e) =>
                            ((e.currentTarget.style.background = "transparent"))
                          }
                          aria-label={`Open history ${h.title}`}
                          title={h.title}
                        >
                          {h.title}
                        </button>
                        {h.id && (
                          <button
                            onClick={() => requestDeleteHistory(h)}
                            aria-label={`Delete history ${h.title}`}
                            title="Delete history"
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              color: "#d32f2f",
                              display: "flex",
                              alignItems: "center",
                              padding: 6,
                              borderRadius: 6,
                            }}
                          >
                            <RestoreFromTrashOutlined sx={{ fontSize: 18 }} />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Box>
            )}
          </div>

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

{isSmallScreen && (

                  <li>
  <Box
    sx={{
      mt: 2,
      px: 1,
      py: 1,
      borderTop: `1px solid ${theme.palette.grey[100]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
      Theme Mode
    </Typography>
    <Button
      onClick={toggleColorMode}
      size="small"
      variant="outlined"
      startIcon={mode === 'light' ? <Brightness7Icon /> : <Brightness4Icon />}
    >
      {mode === 'light' ? 'Light' : 'Dark'}
    </Button>
  </Box>


                  </li>
                  )}

                
                    { cookies.user && isSmallScreen &&
 <li
                    style={{
                      borderRadius: 6,
                      transition: "background 0.2s",
                    }}
                   
                  >
                    <Link href="/bookmarks" passHref legacyBehavior>
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
                        <FavoriteBorderIcon sx={{width:15, height:15}} />

                        </span>
                        <span>Wishlist</span>
                      </a>
                    </Link>
                  </li>

                    }
                  
                 

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
                        <InfoOutlined sx={{width:15, height:15}}/>

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
                    <Link href="/notifications" passHref legacyBehavior>
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

      <Dialog open={confirmOpen} onClose={cancelDelete} aria-labelledby="confirm-delete-title">
        <DialogTitle id="confirm-delete-title">Delete history?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14 }}>
            Are you sure you want to delete "{pendingDelete?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} variant="text">Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

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
