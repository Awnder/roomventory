'use client';

import { Button } from "@mui/material";

//colors
const green_light = "#D3F8CC";
const green_dark = "#4E826B";
const green_black = "#1C2025";

export function LightButton({children, href, fullWidth, m, mt, mb, ml, mr}) {
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
          transform: "scale(1.05)",
        },
        m: m,
        mt: mt,
        mb: mb,
        ml: ml,
        mr: mr
      }}
      href={href}
      fullWidth={fullWidth}
    >
      {children}
    </Button>
  )
}

export function DarkButton({children, href, fullWidth, m, mt, mb, ml, mr}) {
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
          transform: "scale(1.05)",
        },
        m: m,
        mt: mt,
        mb: mb,
        ml: ml,
        mr: mr
      }}
      href={href}
      fullWidth={fullWidth}
    >
      {children}
    </Button>
  )
}