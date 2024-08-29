'use client';

import { Box, Grid, Typography, Modal, Stack, Button, TextField } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { useState, useEffect } from "react";

// colors
const green_white = "#F3F6F9";
const green_light = "#D3F8CC";
const green_dark = "#4E826B";
const gray_dark = "#1C2025";

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [addInventoryModal, setAddInventoryModal] = useState(false);
  const [inventoryName, setInventoryName] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const router = useRouter();

  const handleSubmit = async () => {
    setInventoryName("");
    setAddInventoryModal(false);
  }

  // useEffect(() => {
  //   async function getInventories() {
  //     if (!user) return;
  //     const docRef = doc(collection(db, "users"), user.id);
  //     const docSnap = await getDoc(docRef);

  //     if (docSnap.exists()) {
  //       const collections = docSnap.data().inventories || [];

  //       setFlashcards(docSnap.data().inventories);
  //     } else {
  //       await setDoc(docRef, { inventories: [] });
  //     }
  //   }
  //   getFlashcards();
  // }, [user]);

  // if (!isLoaded || !isSignedIn) {
  //   return <></>;
  // }

  // const handleCardClick = (id) => {
  //   router.push(`/inventory?id=${id}`);
  // };


  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
    >
      <Box width="80%" maxWidth="lg">
        <Typography 
          variant="h3"
          textAlign="center"
          color={green_light}
          bgcolor={green_dark}
          borderRadius="20px"
          py={2}
          px={4}
          mt={5}
        >
          Welcome to your Dashboard
        </Typography>
      </Box>
      <Box width="80%" maxWidth="lg" my={5}>
        <Grid container flexGrow={1} spacing={2}>
          {/* {inventories.map((inventory, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}
              onClick={() => handleInventoryClick(inventory.name)}
              sx={{
                transition: "500ms",
                "&:hover": {
                  transform: "scale(1.02)",
                }
              }}
            >
              <Typography 
                variant="h6" 
                maxHeight="100%" 
                overflow="auto" 
                textAlign="center"
                sx={{overflowWrap: "break-word"}}
              >
                {inventory.name}
              </Typography>
            </Grid>  
          ))} */}
          <Grid item xs={12} sm={6} md={4}>
            <Box 
              height="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              borderRadius={"15px"}
              minHeight="200px"
              bgcolor={green_light}
              color={green_dark}
              border={`2px solid ${green_dark}`}
              onClick={() => handleInventoryClick(inventory.name)}
              sx={{
                transition: "500ms",
                "&:hover": {
                  transform: "scale(1.02)",
                  bgcolor:`${green_dark}`,
                  color:`${green_white}`
                }
              }}
            >
              <Typography 
                variant="h6" 
                maxHeight="100%"
                width="90%"
                overflow="auto" 
                textAlign="center"
                sx={{overflowWrap: "break-word"}}
              >
                Inventory name here
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box 
              height="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              borderRadius={"15px"}
              minHeight="200px"
              bgcolor={green_light}
              color={green_dark}
              border={`2px solid ${green_dark}`}
              onClick={() => handleInventoryClick(inventory.name)}
              sx={{
                transition: "500ms",
                "&:hover": {
                  transform: "scale(1.02)",
                  bgcolor:`${green_dark}`,
                  color:`${green_white}`
                }
              }}
            >
              <Typography 
                variant="h6" 
                maxHeight="100%"
                width="90%"
                overflow="auto" 
                textAlign="center"
                sx={{overflowWrap: "break-word"}}
              >
                Inventory name here
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box 
              height="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              borderRadius={"15px"}
              minHeight="200px"
              bgcolor={green_light}
              color={green_dark}
              border={`2px solid ${green_dark}`}
              onClick={() => handleInventoryClick(inventory.name)}
              sx={{
                transition: "500ms",
                "&:hover": {
                  transform: "scale(1.02)",
                  bgcolor:`${green_dark}`,
                  color:`${green_white}`
                }
              }}
            >
              <Typography 
                variant="h6" 
                maxHeight="100%"
                width="90%"
                overflow="auto" 
                textAlign="center"
                sx={{overflowWrap: "break-word"}}
              >
                Inventory name here
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box width="80%" maxWidth="lg" display="flex" sx={{ justifyContent: { xs:"center", sm:"center", md:"flex-end" } }} >
        <AddCircleOutlineIcon 
          onClick={() => setAddInventoryModal(true)} 
          color="success" 
          sx={{ 
            fontSize: 70, 
            transition: "200ms",
            "&:hover": {
              transform: "rotate(180deg) scale(1.05)",
            }
          }} 
        />
      </Box>

      <Modal open={addInventoryModal} onClose={() => setAddInventoryModal(false)}>
        <Box
          flex="display"
          justifyContent="center"
          alignItems="center"
          bgcolor={green_white}
          width="500px"
          height="200px"
          border="2px solid black"
          borderRadius="15px"
          p={3}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h4" textAlign="center" color={green_dark} mb={2}>Add Inventory</Typography>
          <Stack flexDirection="row">
            <TextField
              fullWidth
              label="Inventory Name"
              value={inventoryName}
              onChange={(e) => setInventoryName(e.target.value)}
              sx={{ mr: 2 }}
            />
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Create
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}