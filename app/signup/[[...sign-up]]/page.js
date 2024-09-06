'use client';

import { Box, Typography } from "@mui/material";
import { SignUp } from "@clerk/nextjs";

const green_main = "#7EB09B";
const green_dark = "#4E826B";

export default function SignUpPage() {
  return (
    <Box
      width="100vw"
      height="90vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Typography variant="h4" textAlign="center" color={`${green_dark}`} my={8} borderBottom={`2px solid ${green_main}`}>Welcome To Roomvenetory!</Typography>
      <SignUp />
    </Box>
  )
}