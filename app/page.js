'use client';

import { Box, Stack, Grid, Typography, Button } from "@mui/material";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import CheckIcon from '@mui/icons-material/Check';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CloseIcon from '@mui/icons-material/Close';
import { DarkButton, LightButton } from "../Components/styledbuttons";

import Image from "next/image";
import toiletpaper from '/public/toiletpaper.jpg';
import "./globals.css";
// import chat from "public/chat.png"

//colors
const green_light = "#D3F8CC";
const green_dark = "#4E826B";
const gray_dark = "#1C2025";


export default function Home() {
  return (
    <Box minHeight="100vh">
      <Stack direction="column" width="100%" justifyContent="center" alignItems="center">
  {/* Title and Call to Action */}
          <Stack direction="column" alignItems="center" textAlign="center" my={15} mx={2}>
            <Box
              display="flex"
              borderRadius="10px"
              justifyContent="center"
              my={5}
              sx={{
                background: `linear-gradient(to right, ${green_light}, ${green_light}, #fff)`,
                '@media only screen and (max-width: 600px)': {
                    scale: "0.75"
                },
                animation: "entranceTitle 2s ease-out",
              }}
            >
              <Typography
                className="title"
                variant="h1"
                color={`${green_light}`} 
                bgcolor={`${green_dark}`}
                borderRadius={"10px"} 
                px={1}
                sx={{
                  '@media only screen and (max-width: 600px)': {
                    fontSize: "75px"
                  },
                }}
              >
                Room
              </Typography>
              <Typography 
                variant="h1"
                color={`${green_dark}`} 
                sx={{
                  '@media only screen and (max-width: 600px)': {
                    fontSize: "75px"
                  },
                }}
              >
                ventory
              </Typography>
            </Box>
            <Typography variant="h5" color={`${gray_dark}`} mb={5} mx={5} sx={{ animation: "entranceSubtitle 2s ease-out",}}>
              The collective inventory for you and your roommates
            </Typography>
            <SignedOut>
              <Box sx={{animation: "entranceButton 2s ease-out"}}>
                <LightButton href="/signup"><Typography variant="h6">Get Started</Typography></LightButton>
              </Box>
            </SignedOut>
            <SignedIn>
              <Box sx={{animation: "entranceButton 2s ease-out"}}>
                <DarkButton href="/dashboard" ><Typography variant="h6">To your inventory</Typography></DarkButton>
              </Box>
            </SignedIn>
          </Stack>
  {/* Toilet Paper Example */}
        <Box 
          display="flex" 
          flexDirection="row" 
          justifyContent="center" 
          alignContent="center" 
          flexWrap="wrap" 
          width="100%"
          mb={10}
          bgcolor={`${green_dark}`}
        >
          <Stack direction="column" justifyContent="center" alignContent="center">
            <Stack 
              direction="column" 
              justifyContent="center" 
              textAlign="center" 
              height="80%"
              borderRadius="15px" 
              bgcolor={`${green_light}`}
              mx={4}
              p={5}
              sx={{
                boxShadow: `0 0 15px ${gray_dark}`
              }}
            >
              <Typography variant="h4" my={1}><CheckIcon sx={{ fontSize: 35 }} /> Know what you have</Typography>
              <Typography variant="h4" my={1}><PriorityHighIcon sx={{ fontSize: 35 }} /> Know what you need</Typography>
              <Typography variant="h6" my={1}><CloseIcon sx={{ fontSize: 35 }} /> Never buy too much toilet paper again</Typography>
            </Stack>
          </Stack>
          <Box my={3} mx={4}>
            <Image src={toiletpaper} alt="Roomventory Toilet Paper Image" height={500}></Image>
          </Box>
        </Box>
  {/* Features and Explanation */}
        <Box maxWidth="70vw" mb={8}>
          <Grid container flexGrow={1} spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="h3"
                textAlign="center"
                color={`${green_light}`} 
                bgcolor={`${green_dark}`}
                borderRadius="10px" 
                py={2}
                boxShadow="0 0 10px black"
              >
                Features & Goals
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Box
                height="100%"
                p={2}
                sx={{
                  boxShadow: `0 0 10px ${green_dark}`,
                  background: `linear-gradient(to bottom, #fff,${green_light})`,
                  transition: "200ms",
                  '&:hover': {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Typography variant="h5" mb={2}>Inventory Collections</Typography>
                <Typography>Manage your inventory by placing items in collections. Toilet paper goes in the bathroom, not the kitchen!</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Box
                height="100%"
                p={2}
                sx={{
                  boxShadow: `0 0 10px ${green_dark}`,
                  background: `linear-gradient(to bottom, #fff,${green_light})`,
                  transition: "200ms",
                  '&:hover': {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Typography variant="h5" mb={2}>Multiple Group Inventories</Typography>
                <Typography>Keep inventories separate by joining and participating in multiple groups, each with their own inventories.</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Box
                height="100%"
                p={2}
                sx={{
                  boxShadow: `0 0 10px ${green_dark}`,
                  background: `linear-gradient(to bottom, #fff,${green_light})`,
                  transition: "200ms",
                  '&:hover': {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Typography variant="h5" mb={2}>Item Tags</Typography>
                <Typography>Items come with name tags, so you know who added what. Now you can blame 'that' guy for not buying his share.</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Box
                height="100%"
                p={2}
                sx={{
                  boxShadow: `0 0 10px ${green_dark}`,
                  background: `linear-gradient(to bottom, #fff,${green_light})`,
                  transition: "200ms",
                  '&:hover': {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Typography variant="h5" mb={2}>Shopping List</Typography>
                <Typography>Have shopping lists for each inventory collection so that you know what you need to buy.</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Box
                height="100%"
                p={2}
                sx={{
                  boxShadow: `0 0 10px ${green_dark}`,
                  background: `linear-gradient(to bottom, #fff,${green_light})`,
                  transition: "200ms",
                  '&:hover': {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Typography variant="h5" mb={2}>Price & Debit</Typography>
                <Typography>Add the price of an item you bought and know how much your friends should pay you back.</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Box
                height="100%"
                p={2}
                sx={{
                  boxShadow: `0 0 10px ${green_dark}`,
                  background: `linear-gradient(to bottom, #fff,${green_light})`,
                  transition: "200ms",
                  '&:hover': {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Typography variant="h5" mb={2}>AI Insights</Typography>
                <Typography>Helpful AI prompting suggests items that you might need based on your current inventory.</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
}
