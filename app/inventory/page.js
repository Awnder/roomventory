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
  AccordionSummary,
  Chip,
  Avatar,
  Divider
 } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Search } from "@mui/icons-material";

import { useState } from "react";

// colors
const green_white = "#F3F6F9";
const green_light = "#D3F8CC";
const green_dark = "#4E826B";
const gray_dark = "#1C2025";

function InventoryAccordion({inventoryItems, containerName, index}) {
  return (
    <Accordion>
      <AccordionSummary 
        expandIcon={<ArrowDropDownIcon />}
        aria-controls={index}
        id={index}
        sx={{
          width: "100%",
          maxWidth: "100%",
          textOverflow:"ellipsis"
        }}
      >
        <Typography color="black" width="100%" sx={{ typography: {xs: "h6", sm: "h5"} }}>{containerName}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction="column" my={1}>
          {inventoryItems}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

function InventoryItem({children, itemName, itemNumber}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ border:`2px solid ${green_dark}` }}>
      <Stack direction="column" alignItems="center">
        {children}
      </Stack>
      <Typography>{itemName}</Typography>
      <Typography>{itemNumber}</Typography>
      <Box>
        <RemoveIcon />
        <AddIcon />
        <DeleteOutlineIcon />
      </Box>
    </Stack>
  )
}

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
        mt={8}
        mb={10}
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
      <Box width="80%" maxWidth="xl" display="flex" justifyContent="center" alignItems="center">
        <Grid container flexGrow={1} spacing={2}>
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <InventoryAccordion containerName="hello there" index="1">
              <InventoryItem itemName="popcorn" itemNumber="2">
                <Chip avatar={<Avatar>A</Avatar>} label="Andrew" variant="outlined" />
              </InventoryItem>
            </InventoryAccordion>
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6}>
            
          </Grid>
        </Grid>
      </Box>
    </Stack>
  )
}