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
import { db } from "/firebase";
import {
  writeBatch,
  doc,
  collection,
  getDoc,
  getDocs,
  setDocs,
  setDoc,
} from "firebase/firestore";
import { useState, useEffect, useCallback } from "react";

// colors
const green_white = "#F3F6F9";
const green_light = "#D3F8CC";
const green_dark = "#4E826B";
const gray_dark = "#1C2025";

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [addInventoryModal, setAddInventoryModal] = useState(false);
  const [inventoryName, setInventoryName] = useState("");
  const [itemName, setItemName] = useState("");
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
  const createGroup = useCallback(async () => {
    if (!groupName) {
      alert("Please enter a group name");
      console.log("No group name", groupName);
      return;
    }

    const userName = `${user.firstName} ${user.lastName}`;

    const newGroup = {
      name: groupName,
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
    setAddInventoryModal(false);
  }, [groupName, user]);

  //function to delete a group from the database
  const deleteGroup = async (group, batch) => {
    console.log("group", group);
    const groupRef = doc(collection(db, "groups"), group);
    console.log("test");
    const groupSnap = await getDoc(groupRef);

    // Get inventories collection
    const inventoriesCollection = collection(
      db,
      "groups",
      group,
      "inventories"
    );
    console.log("inventories Collection", inventoriesCollection);
    const inventoriesSnap = await getDocs(inventoriesCollection);
    console.log("inventories Snap", inventoriesSnap);

    if (groupSnap.exists() && inventoriesSnap.size > 0) {
      // Process inventories
      const inventoryPromises = inventoriesSnap.docs.map(async (inventory) => {
        console.log("inventory", inventory);
        const inventoryName = inventory.data().name;
        const inventoryRef = doc(inventoriesCollection, inventoryName);
        const inventorySnap = await getDoc(inventoryRef);

        const itemsCollection = collection(
          db,
          "groups",
          group,
          "inventories",
          inventoryName,
          "items"
        );
        const itemsSnap = await getDocs(itemsCollection);

        if (inventorySnap.exists() && itemsSnap.size > 0) {
          // Process items
          const itemPromises = itemsSnap.docs.map(async (item) => {
            const itemName = item.data().name;
            const itemRef = doc(itemsCollection, itemName);

            batch.delete(itemRef);
            console.log("Item scheduled for deletion");
          });

          // Wait for all item deletions to be scheduled
          await Promise.all(itemPromises);
        }

        batch.delete(inventoryRef);
        console.log("Inventory scheduled for deletion");
      });

      // Wait for all inventory deletions to be scheduled
      await Promise.all(inventoryPromises);
    }

    // Finally, delete the group
    batch.delete(groupRef);
    console.log("Group scheduled for deletion");
  };

  //function to leave a group
  const leaveGroup = async () => {
    const userName = `${user.firstName} ${user.lastName}`;
    const userDocRef = doc(collection(db, "users"), user.id);
    console.log("Group Name:", groupName);

    const groupDocRef = doc(collection(db, "groups"), groupName);

    const batch = writeBatch(db);

    //adjust user's groups
    try {
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const newGroups = userData.groups.filter(
          (group) => group !== groupName
        );

        batch.update(userDocRef, {
          groups: newGroups,
        });
      }
    } catch (error) {
      console.error("Error adjusting user's groups:", error);
      alert("An error occurred while leaving the group. Please try again.");
    }

    //adjust group's members
    try {
      const groupSnap = await getDoc(groupDocRef);
      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const newMembers = groupData.members.filter(
          (member) => member !== userName
        );

        if (newMembers.length === 0) {
          await deleteGroup(groupName, batch);
        } else {
          batch.update(groupDocRef, {
            members: newMembers,
          });
        }
      }
    } catch (error) {
      console.error("Error adjusting group's members:", error);
      alert("An error occurred while leaving the group. Please try again.");
    }

    await batch.commit();
    console.log("Commit is DONE");
  };

  const createInventory = async () => {
    if (!inventoryName) {
      alert("Please enter an inventory name");
      return;
    }

    const batch = writeBatch(db);

    const groupRef = doc(collection(db, "groups"), "home");
    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, inventoryName);
    const inventorySnap = await getDoc(inventoryRef);

    if (inventorySnap.exists()) {
      alert("Inventory already exists");
      return;
    } else {
      await setDoc(inventoryRef, { name: inventoryName });
    }
    setInventoryName("");
  };

  const addItem = async () => {
    const groupRef = doc(collection(db, "groups"), "home");
    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, "Bathroom");

    const itemsCollection = collection(inventoryRef, "items");

    const itemRef = doc(itemsCollection, itemName);
    const itemSnap = await getDoc(itemRef);

    //this can be adjusted later to add quantity to the item
    if (itemSnap.exists()) {
      alert("Item already exists, maybe add quantity?");
      return;
    } else {
      //fields in the item document can be adjusted later
      await setDoc(itemRef, { name: itemName, quantity: 1 });
    }
    setItemName("");
  };

  //function to fetch the user's groups from the database (will be executed on page load)
  useEffect(() => {
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

    getGroups();
  }, [user, createGroup]);

  // Log the updated `groups` whenever it changes
  useEffect(() => {
    console.log("Updated Groups", groups);
  }, [groups]);

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
          {groups.map((group, index) => (
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
                onClick={() => handleInventoryClick(group)}
                sx={{
                  transition: "500ms",
                  "&:hover": {
                    transform: "scale(1.02)",
                    bgcolor: `${green_dark}`,
                    color: `${green_white}`,
                  },
                }}
              >
                <Typography
                  variant="h6"
                  maxHeight="100%"
                  width="90%"
                  overflow="auto"
                  textAlign="center"
                  sx={{ overflowWrap: "break-word" }}
                >
                  {group}
                </Typography>
              </Box>
            </Grid>
          ))}
          {/*
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
                  bgcolor: `${green_dark}`,
                  color: `${green_white}`,
                },
              }}
            >
              <Typography
                variant="h6"
                maxHeight="100%"
                width="90%"
                overflow="auto"
                textAlign="center"
                sx={{ overflowWrap: "break-word" }}
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
                  bgcolor: `${green_dark}`,
                  color: `${green_white}`,
                },
              }}
            >
              <Typography
                variant="h6"
                maxHeight="100%"
                width="90%"
                overflow="auto"
                textAlign="center"
                sx={{ overflowWrap: "break-word" }}
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
                  bgcolor: `${green_dark}`,
                  color: `${green_white}`,
                },
              }}
            >
              <Typography
                variant="h6"
                maxHeight="100%"
                width="90%"
                overflow="auto"
                textAlign="center"
                sx={{ overflowWrap: "break-word" }}
              >
                Inventory name here
              </Typography>
            </Box>
          </Grid>
          */}
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
            },
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
          <Typography variant="h4" textAlign="center" color={green_dark} mb={2}>
            Add Inventory
          </Typography>
          <Stack flexDirection="row">
            <TextField
              fullWidth
              label="Inventory Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              sx={{ mr: 2 }}
            />
            <Button variant="contained" color="success" onClick={createGroup}>
              Create
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
