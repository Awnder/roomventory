'use client';

import { Box, Typography, Stack } from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';
import Image from "next/image";
import Link from "next/link";
import rv_logo_2 from "/public/rv_logo_2.png";

//colors
const green_white = "#F3F6F9";
const green_light = "#D3F8CC";
const green_dark = "#4E826B";

export default function Footer() {
  return (
    <Stack width="100%" height="8vh" bgcolor={green_dark} justifyContent="center" alignItems="space-between">
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} mx={5}>
        <Image src={rv_logo_2} alt="Roomventory Footer Logo" width={50}></Image>
        <Link href="https://github.com/Awnder/roomventory">
          <GitHubIcon 
            sx={{ 
              color: `${green_light}`, 
              fontSize: 30,
              transition: "200ms",
              "&:hover": {
                transform: "scale(1.1)"
              }
            }} 
          />
        </Link>
      </Stack>
    </Stack>
  )
}