'use client';

import { Box, Stack, Grid, Typography, Button } from "@mui/material";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import CheckIcon from '@mui/icons-material/Check';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CloseIcon from '@mui/icons-material/Close';

import Image from "next/image";
import toiletpaper from '/public/toiletpaper.jpg';
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
            <Box display="flex" flexWrap="wrap" justifyContent="center" my={5} sx={{ background: `linear-gradient(to right, ${green_light}, ${green_light}, #fff)` }}>
              <Typography
                variant="h1"
                color={`${green_light}`} 
                bgcolor={`${green_dark}`}
                borderRadius={"10px"} 
                px={1}
              >
                Room
              </Typography>
              <Typography 
                variant="h1" 
                color={`${green_dark}`} 
              >
                ventory
              </Typography>
            </Box>
            <Typography variant="h5" color={`${gray_dark}`} mb={5} mx={5}>The collective inventory for you and your roommates</Typography>
            <Button
                variant="contained"
                sx={{
                  color: `${gray_dark}`,
                  bgcolor: `${green_light}`,
                  borderRadius: "10px",
                  transition: "200ms",
                  "&:hover": {
                    color: `${green_light}`,
                    bgcolor: `${green_dark}`,
                    transform: "scale(1.1)",
                  },
                }}
                href="https://forms.gle/r4Q1dvHoLoNzeecS7"
                target="_blank"
              >
                <Typography variant="h6">Join the Waitlist</Typography>
              </Button>
            {/* <Typography variant="h6" py={2} px={4} bgcolor={green_light} borderRadius="10px">Coming Soon!</Typography> */}
            {/* <SignedOut>
              <Button
                variant="contained"
                sx={{
                  color: `${gray_dark}`,
                  bgcolor: `${green_light}`,
                  borderRadius: "10px",
                  transition: "200ms",
                  "&:hover": {
                    color: `${green_light}`,
                    bgcolor: `${green_dark}`,
                    transform: "scale(1.1)",
                  },
                }}
                href="/signup"
              >
                <Typography variant="h6">I'm Interested</Typography>
              </Button>
            </SignedOut>
            <SignedIn>
              <Typography>
                You're in! Thank you for joining the waitlist!
              </Typography>
            </SignedIn> */}
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
            >
              Features & Goals
            </Typography>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Box height="100%" p={2} sx={{ boxShadow: `0 0 10px ${green_dark}`, background: `linear-gradient(to bottom, #fff, ${green_light})` }}>
                <Typography variant="h5" mb={2}>Inventory Collections</Typography>
                <Typography>Manage your inventory by placing items in collections. Toilet paper goes in the bathroom, not the kitchen!</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Box height="100%" p={2} sx={{ boxShadow: `0 0 10px ${green_dark}`, background: `linear-gradient(to bottom, #fff, ${green_light})` }}>
                <Typography variant="h5" mb={2}>Multiple Group Inventories</Typography>
                <Typography>Keep inventories separate by joining and participating in multiple groups, each with their own inventories.</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Box height="100%" p={2} sx={{ boxShadow: `0 0 10px ${green_dark}`, background: `linear-gradient(to bottom, #fff, ${green_light})` }}>
                <Typography variant="h5" mb={2}>Item Tags</Typography>
                <Typography>Items come with name tags, so you know who added what. Now you can blame 'that' guy for not buying his share of toilet paper. Additionally, emergency tags let you know if items are low.</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Box height="100%" p={2} sx={{ boxShadow: `0 0 10px ${green_dark}`, background: `linear-gradient(to bottom, #fff, ${green_light})` }}>
                <Typography variant="h5" mb={2}>Future Goal: Picture Perfect</Typography>
                <Typography>Leverage computer vision and AI to add items to your inventories with a photo of your items.</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
            <Box height="100%" p={2} sx={{ boxShadow: `0 0 10px ${green_dark}`, background: `linear-gradient(to bottom, #fff, ${green_light})` }}>
                <Typography variant="h5" mb={2}>Future Goal: AI Suggests</Typography>
                <Typography>Helpful AI prompting suggests items that you might need based on your current inventory.</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
}
