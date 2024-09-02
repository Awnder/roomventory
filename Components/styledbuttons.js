'use client';

import { Button } from "@mui/material";

//colors
const green_white = "#F3F6F9";
const green_light = "#D3F8CC";
const green_main = "#7EB09B";
const green_dark = "#4E826B";
const green_darkest = "#1D3417";
const green_black = "#1C2025";

export function DarkButton({children, href, m, mt, mb, ml, mr}) {
  return (
    <Button
      variant="contained"
      sx={{
        color: `${green_black}`,
        bgcolor: `${green_light}`,
        borderRadius: "10px",
        transition: "200ms",
        "&:hover": {
          color: `${green_light}`,
          bgcolor: `${green_dark}`,
          transform: "scale(1.1)",
        },
        m: m,
        mt: mt,
        mb: mb,
        ml: ml,
        mr: mr
      }}
      href={href}
    >
      {children}
    </Button>
  )
}

export function LightButton({children, href, m, mt, mb, ml, mr}) {
  return (
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
        m: m,
        mt: mt,
        mb: mb,
        ml: ml,
        mr: mr
      }}
      href={href}
    >
      {children}
    </Button>
  )
}