'use client'

import { 
  Box, 
  Grid, 
  Typography,
  Modal, 
  Stack, 
  Button, 
  TextField, 
  InputAdornment,
  Accordion,
  AccordionDetails,
  AccordionSummary
 } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Search } from "@mui/icons-material";

import { useState } from "react";

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
      sx={{ background: `linear-gradient(to bottom, white, ${green_light})` }}
    >
      <Stack
        direction="column"
        alignItems="center"
        width="100%"
        py={10}
      >
        <Typography 
          textAlign="center" 
          color={green_light} 
          bgcolor={green_dark}
          width="80%"
          maxWidth="lg"
          borderRadius="20px"
          p={3}
          mb={5}
          sx={{ typography: {xs: "h5", sm: "h4"} }}
        >
          Welcome name to roommate group 1
        </Typography>
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
          <Box>
            <Typography 
            flexGrow={1} 
            textAlign="center" 
            color={green_light} 
            px={2}
            mb={2} 
            sx={{ typography: {xs: "h5", sm: "h4"} }}
          >
            Roommates
          </Typography>
            <Typography textAlign="center" color="white">REPLACE WITH ROOMMATES HERE</Typography>
          </Box>            
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
          width="60%" 
          maxWidth="md"
          bgcolor={green_light} 
          border="1px solid black"
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
      <Box width="80%" maxWidth="lg" display="flex" justifyContent="center" alignItems="center">
        <Grid container flexGrow={1} spacing={2}>
          <Grid item xs={12} sm={6}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="index number"
                id="index number"
              >
                <Typography color="black" maxWidth="100%" overflow="auto" sx={{ typography: {xs: "h6", sm: "h5"} }}>name of container</Typography>
              </AccordionSummary>
              <AccordionDetails>
                
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item xs={12} sm={6}>
          <Accordion>
              <AccordionSummary 
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="index number"
                id="index number"
                sx={{
                  border:"2px solid red",
                  width: "100%",
                  maxWidth: "100%",
                  textOverflow:"ellipsis"
                }}
              >
                <Typography color="black" border={'2px solid blue'} width="100%" sx={{ typography: {xs: "h6", sm: "h5"} }}>loreumloreumloreumloreumloreumloreumloreumloreumloreumloreumloreumloreumloreum</Typography>
              </AccordionSummary>
              <AccordionDetails>
                
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  )
}