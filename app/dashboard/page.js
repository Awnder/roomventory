"use client";

import {
  Box,
  Grid,
  Typography,
  Modal,
  Stack,
  Button,
  InputAdornment,
  TextField,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
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
  query,
  where,
} from "firebase/firestore";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image"; 
import banner from "../../public/banner.png";

// colors
const green_white = "#F3F6F9";
const green_light = "#D3F8CC";
const green_dark = "#4E826B";
const gray_dark = "#1C2025";

export default function Dashboard() {
  /****************************************************** States ******************************************************/
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // States for functions
  const [inventoryName, setInventoryName] = useState("");
  const [itemName, setItemName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [email, setEmail] = useState("");

  // Real data from Firebase
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);

  const [addInventoryModal, setAddInventoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  /****************************************************** Routing ******************************************************/

  const handleGroupClick = (name) => {
    router.push(`/group?id=${name}`);
  };

  /****************************************************** Handling Groups ******************************************************/

  //function to add a group (that includes the user that created it) to the database (1 READ, 1 WRITE)
  const createGroup = useCallback(async () => {
    if (!groupName) {
      alert("Please enter a group name");
      return;
    }

    const userName = `${user.firstName} ${user.lastName}`;

    const newGroup = {
      name: groupName,
      members: [{name: `${userName}`, leader: true}],
    };

    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, "users"), user.id);
    const groupDocRef = doc(collection(db, "groups"), groupName);

    try {
      // Check if user exists
      //READ
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
      //READ
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


  // Function to delete a group from the database (n READ, n WRITE)
  const deleteGroup = async (group, batch) => {
    const groupRef = doc(collection(db, "groups"), group);
    //READ
    const groupSnap = await getDoc(groupRef);

    // Get inventories collection
    const inventoriesCollection = collection(
      db,
      "groups",
      group,
      "inventories"
    );
    //READ
    const inventoriesSnap = await getDocs(inventoriesCollection);

    if (groupSnap.exists() && inventoriesSnap.size > 0) {
      // Process inventories
      const inventoryPromises = inventoriesSnap.docs.map(async (inventory) => {
        const inventoryName = inventory.data().name;
        const inventoryRef = doc(inventoriesCollection, inventoryName);
        //READ
        const inventorySnap = await getDoc(inventoryRef);
        
        //DELETE
        batch.delete(inventoryRef);
      });

      // Wait for all inventory deletions to be scheduled
      await Promise.all(inventoryPromises);
    }

    // Finally, delete the group
    batch.delete(groupRef);
  };


  // Function to leave a group (1 READ, 2 WRITE)
 const leaveGroup = async () => {

    const userDocRef = doc(collection(db, "users"), user.id);

    const groupDocRef = doc(collection(db, "groups"), groupName);

    const batch = writeBatch(db);

    //adjust user's groups
    try {
      //READ
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
      //READ
      const groupSnap = await getDoc(groupDocRef);
      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const newMembers = groupData.members.filter(
          (member) => member.name !== userName
        );

        if (newMembers.length === 0) {
          //DELETE
          await deleteGroup(groupName, batch);
        } else {
          newMembers[0].leader = true;
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
    setGroupName("");
  };

  /****************************************************** Use Effects ******************************************************/

  // Function to fetch the user's groups from the database (2 READS)
  useEffect(() => {
    const getGroups = async () => {
      if (!user) return;

      const userRef = doc(collection(db, "users"), user.id);
      //READ
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const groupsCol = userSnap.data().groups || [];

        const groupsRef = collection(db, "groups");
        const q = query(groupsRef, where("name", "in", groupsCol));

        //READ
        const querySnapshot = await getDocs(q);

        const groupObjects = querySnapshot.docs.map((doc) => doc.data());

        setGroups(groupObjects);
        setFilteredGroups(groupObjects);
      } else {
        console.log("User does not exist");
      }
    };

    getGroups();
  }, [user, createGroup]);

  // Function to filter groups based on search term
  useEffect(() => {
    setFilteredGroups(groups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  }, [searchTerm]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
    >
      <Box 
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="80%" 
        height="200px"
        maxWidth="lg" 
        position="relative" 
        overflow="hidden"
        borderRadius="20px"
        mt={5}
      >
        <Image
          src={banner}
          alt="Roomventory banner"
          placeholder="blur"
          fill
          priority
          style={{
            objectFit: "cover",
            objectPosition: "center",
            filter: "blur(2px)",
          }}
        />
        <Box
            width="80%"
            maxWidth="lg"
            borderRadius="20px"
            position="absolute"
            p={3}
            bgcolor="rgba(78, 130, 107, 0.7)" // rgba for green_dark, needed opacity scale
          >
            <Typography
              textAlign="center"
              color={green_white}
              sx={{ typography: { xs: "h5", sm: "h4" } }}
            >
              Welcome *Name* to your Dashboard
            </Typography>
        </Box>
      </Box>
      <Box
          width="60%"
          maxWidth="md"
          border="1px solid black"
          borderRadius="20px"
          mt={4}
          p={2}
          sx={{ background: `linear-gradient(to left, #fff, ${green_light})` }}
        >
          <TextField
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      <Box width="80%" maxWidth="lg" my={5}>
        <Grid container flexGrow={1} spacing={2}>
          {filteredGroups.map((group, index) => (
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
                boxShadow="0 0 5px black"
                border={`2px solid ${green_dark}`}
                onClick={() => handleGroupClick(group.name)}
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
                  sx={{ overflowWrap: "break-word", '&:hover': { cursor: "pointer" }}}
                >
                  {group.name}
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
        justifyContent="flex-end"
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
          width="lg"
          height="lg"
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
          <Typography textAlign="center" color={green_dark} mb={2} sx={{ typography: { xs: "h6", sm: "h5" } }}>
            Create New Group
          </Typography>
          <Stack sx={{ direction: {xs: "column", sm: "row"} }}>
            <TextField
              fullWidth
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              sx={{ mr: 2, mb: {xs: 2} }}
            />
            <Button variant="contained" color="success" onClick={createGroup} fullWidth>
              Create
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
