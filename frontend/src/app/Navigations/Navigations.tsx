import React from "react";
import { useTheme } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import FixedBottomMessage from "@/components/common/FixedBottomMessage";
import BottomNavigationBar from "@/components/Header/BottomNavigation";

type Props = {};

const Navigations = (props: Props) => {
  const theme = useTheme();
  const isMediumUp = useMediaQuery(theme.breakpoints.up("md")); //
  //
  if (isMediumUp)
    return (
      <FixedBottomMessage message="By messaging AiCarAdvisor, you agree to our Terms and have read our Privacy Policy. See Cookie Preferences." />
    );

  return <BottomNavigationBar />;
};
export default Navigations;
