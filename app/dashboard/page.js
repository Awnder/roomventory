"use client";

import {
  Box,
  Grid,
  Typography,
  Modal,
  Stack,
  Button,
  TextField,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { db } from "@/firebase";
import { writeBatch, doc, collection, getDoc } from "firebase/firestore";
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
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const router = useRouter();

  const handleSubmit = async () => {
    setInventoryName("");
    setAddInventoryModal(false);
  };

  const [email, setEmail] = useState("");

  const handleInvite = async (event) => {
    event.preventDefault();
    const res = await fetch("/api/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Specify the content type
      },
      body: JSON.stringify({ email: email, group: "home" }), // Stringify the email object
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    // Handle response
    console.log(data);
  };

  //function to add a group (that includes the user that created it) to the database
  const createGroup = async () => {
    if (!groupName) {
      alert("Please enter a group name");
      return;
    }

    const userName = `${user.firstName} ${user.lastName}`;

    const newGroup = {
      members: [userName],
    };

    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, "users"), user.id);
    const groupDocRef = doc(collection(db, "groups"), groupName);

    try {
      // Check if user exists
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        // Create user if it does not exist
        const newUser = {
          ID: user.id,
          name: userName,
          groups: [groupName],
        };
        batch.set(userDocRef, newUser);
      } else {
        // Update user with new group
        const userData = userSnap.data();
        if (!userData.groups.includes(groupName)) {
          batch.update(userDocRef, {
            groups: [...userData.groups, groupName], // Alternatively use arrayUnion if you want to handle duplicates automatically
          });
        }
      }

      // Create group if it does not exist
      const groupSnap = await getDoc(groupDocRef);
      if (!groupSnap.exists()) {
        batch.set(groupDocRef, newGroup);
      } else {
        alert("Group already exists");
        return;
      }

      // Commit the batch
      await batch.commit();

      // Clear the input field
      setGroupName("");
    } catch (error) {
      console.error("Error creating group:", error);
      alert("An error occurred while creating the group. Please try again.");
    }
  };

  //function to fetch the user's groups from the database (will be executed on page load)
  const getGroups = async () => {
    if (!user) return;

    const userRef = doc(collection(db, "users"), user.id);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const collection = userSnap.data().groups || [];
      console.log("collection", collection);

      setGroups(collection);
    } else {
      console.log("User does not exist");
    }
  };

  useEffect(() => {
    getGroups();
  }, [user]);

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
        <Grid flexGrow={1} spacing={2}>
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
      <Box
        width="80%"
        maxWidth="lg"
        display="flex"
        sx={{ justifyContent: { xs: "center", sm: "center", md: "flex-end" } }}
      >
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

      <Modal
        open={addInventoryModal}
        onClose={() => setAddInventoryModal(false)}
      >
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
  );
}
