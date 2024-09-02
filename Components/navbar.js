'use client';

import { Box, Container, AppBar, Toolbar, Button, createTheme } from "@mui/material";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { DarkButton, LightButton } from "./styledbuttons";
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

export default function NavBar() {
  return (
    <AppBar position="sticky" color="default"> 
      <Container maxWidth="lg">
        <Toolbar>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Link href="./"><Image src={rv_logo} alt="Roomventory Logo" width={50}></Image></Link>
          </Box>
          <SignedOut>
            <DarkButton href="/signin" mr={2}>Sign In</DarkButton>
            <LightButton href="/signup">Sign Up</LightButton>
          </SignedOut>
          <SignedIn>
            <LightButton href="/dashboard" mr={3}>Dashboard</LightButton>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </Container>
    </AppBar>
  )
}