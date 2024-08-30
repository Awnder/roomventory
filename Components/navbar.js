'use client';

import { Box, Container, AppBar, Toolbar, Button, createTheme } from "@mui/material";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import rv_logo from "/public/rv_logo.png";

//colors
const green_white = "#F3F6F9"
const green_light = "#D3F8CC";
const green_main = "#7EB09B";
const green_dark = "#4E826B";
const green_darkest = "#1D3417";
const green_black = "#1C2025";

const appbartheme = createTheme({
  appBar: {
    bgcolor: "white",
  },
})

export default function NavBar() {
  return (
    <AppBar position="sticky" color="default"> 
      <Container maxWidth="lg">
        <Toolbar>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Link href="./"><Image src={rv_logo} alt="Roomventory Logo" width={50}></Image></Link>
          </Box>
          <SignedOut>
            <Button
              variant="contained"
              sx={{
                color: `${green_black}`,
                bgcolor: `${green_light}`,
                borderRadius: "10px",
                mr: 2,
                transition: "200ms",
                "&:hover": {
                  color: `${green_light}`,
                  bgcolor: `${green_dark}`,
                  transform: "scale(1.1)",
                },
              }}
              href="/signin"
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              sx={{
                color: `${green_light}`,
                bgcolor: `${green_dark}`,
                borderRadius: "10px",
                transition: "200ms",
                "&:hover": {
                  color: `${green_black}`,
                  bgcolor: `${green_light}`,
                  transform: "scale(1.1)",
                },
              }}
              href="/signup"
            >
              Sign Up
            </Button>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </Toolbar>
      </Container>
    </AppBar>
  )
}