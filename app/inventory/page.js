'use client'

import { Box, Grid, Typography, Modal, Stack, Button, TextField, InputAdornment } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from "react";
import { Search } from "@mui/icons-material";

// colors
const green_white = "#F3F6F9";
const green_light = "#D3F8CC";
const green_dark = "#4E826B";
const gray_dark = "#1C2025";

export default function Inventory() {
  const [search, setSearch] = useState("") 

  return (
    <Stack
      direction="column"
      alignItems="center"
      minHeight="100vh"
    >
      <Stack
        direction="column"
        alignItems="center"
        width="100%"
        bgcolor={green_light}
        py={10}
        sx={{ background: `linear-gradient(to bottom, ${green_light}, white)` }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          width="80%"
          maxWidth="lg"
          bgcolor={green_dark}
          borderRadius="20px"
          py={3}
          mb={5}
        >
          <SettingsIcon sx={{ ml: 2, fontSize: {xs: 40, sm: 50}, color: `${green_dark}` }} />
          <Typography flexGrow={1} textAlign="center" color={green_light} px={1} sx={{ typography: {xs: "h6", sm: "h4"} }}>Welcome name to roommate group 1</Typography>
          <SettingsIcon 
            sx={{ 
              mr: 2, 
              fontSize: {xs: 40, sm: 50}, 
              color: `${green_light}`,
              transition: "200ms",
              "&:hover": {
                transform: "rotate(180deg) scale(1.05)",
              }
            }} />
        </Stack>
        <Box 
          width="40%" 
          maxWidth="md" 
          bgcolor={green_light} 
          borderRadius="20px" 
          p={2}
        >
          <TextField
            fullWidth
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              borderRadius: "20px"
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment>
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Stack>
    </Stack>
  )
}