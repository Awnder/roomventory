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
  Tooltip
 } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Opacity, Search } from "@mui/icons-material";

import { useState } from "react";

// colors
const green_white = "#F3F6F9";
const green_light = "#D3F8CC";
const green_dark = "#4E826B";
const gray_dark = "#1C2025";

function InventoryItem({children, itemName, itemNumber}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ border:`2px solid ${green_dark}` }}>
      <Stack direction="column">
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
    <Stack direction="column" alignItems="center" minHeight="100vh">
{/* Begin Document */}
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
          {/* invisible icon to balance out justifyContent space-between */}
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
          border="1px solid black"
          borderRadius="20px" 
          p={2}
          sx={{ background: `linear-gradient(to left, #fff, ${green_light})`}}
        >
          <TextField
            fullWidth
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
{/* Inventory Area */}
      <Box width="80%" maxWidth="xl" display="flex" justifyContent="center" alignItems="center">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
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
                <Typography color="black" border={'2px solid blue'} width="100%" sx={{ typography: {xs: "h6", sm: "h5"} }}>loreumloreumloreumloreumloremloreumloreumloreum</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction="column">
                  {/* below is an inventory item */}
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    borderRadius="15px"
                    position="relative"
                    mb={2}
                    sx={{
                      background: `linear-gradient(to bottom, ${green_light}, #fff)`,
                      "&::before": {
                        position: "absolute",
                        content: "''",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        background: `linear-gradient(to bottom, #fff, ${green_light})`,
                        transition: "opacity 200ms linear",
                        opacity: 0,
                        borderRadius:"15px"
                      },
                      "&:hover::before": {
                        opacity: 1,
                        zIndex: 1,
                        borderRadius:"15px"
                      }
                    }}
                  >
                    <Stack direction="column" zIndex={2}>
                      <Chip label="Andrew" variant="outlined" size="small" sx={{ ml: 1, my: 1, background: `linear-gradient(to bottom, lightblue, white)` }} />
                      <Chip label="Rafik" variant="outlined" size="small" sx={{ ml: 1, mb: 1, background: `linear-gradient(to bottom, yellow, white)` }} />
                    </Stack>
                    <Box zIndex={2}>
                      <Typography sx={{ display: {xs: "block", sm: "inline"}, pr: {xs: 0, sm: 2, md: 3, lg: 3, xl: 4} }}>Name of item</Typography>
                      <Typography sx={{ display: {xs: "block", sm: "inline"}, pl: {xs: 0, sm: 2, md: 3, lg: 3, xl: 4} }}># of item</Typography>
                    </Box>
                    <Box zIndex={2}>
                      <Tooltip title="Delete" placement="top" arrow 
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, -10],
                                },
                              },
                            ],
                          }
                        }}
                      >
                        <DeleteOutlineIcon />
                      </Tooltip>
                      <RemoveIcon />
                      <AddIcon sx={{ mr: 1 }} />
                    </Box>
                  </Stack>
                  
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  )
}