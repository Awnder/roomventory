"use client";

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
  Tooltip,
} from "@mui/material";
import TooltipIcon from "../../Components/tooltipicon";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Category, Opacity, Search } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { db } from "/firebase";
import {
  writeBatch,
  doc,
  collection,
  getDoc,
  deleteDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";

import banner from "../../public/banner.png";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// colors
const green_white = "#F3F6F9";
const green_light = "#D3F8CC";
const green_dark = "#4E826B";
const gray_dark = "#1C2025";

function InventoryItem({ children, itemName, itemNumber }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ border: `2px solid ${green_dark}` }}
    >
      <Stack direction="column">{children}</Stack>
      <Typography>{itemName}</Typography>
      <Typography>{itemNumber}</Typography>
      <Box>
        <RemoveIcon />
        <AddIcon />
        <DeleteOutlineIcon />
      </Box>
    </Stack>
  );
}

export default function Inventory() {
  const [search, setSearch] = useState("");
  const { isLoaded, isSignedIn, user } = useUser();
  const [addInventoryModal, setAddInventoryModal] = useState(false);
  const [inventoryName, setInventoryName] = useState("");
  const [inventories, setInventories] = useState([]);
  const [items, setItems] = useState([]);
  const [neededItems, setNeededItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const router = useRouter();
  const [groupMembers, setGroupMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [suggestedItems, setSuggestedItems] = useState({});

  //Modals
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [openNewInventoryModal, setOpenNewInventoryModal] = useState(false);
  const [openAddItemModal, setOpenAddItemModal] = useState(false);

  const searchParams = useSearchParams();
  const groupName = searchParams.get("id");

  const textInput = useRef(null);

  useEffect(() => {
    const getMembers = async () => {
      const groupRef = doc(collection(db, "groups"), groupName);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        console.log("groupData", groupData);
        setGroupMembers(groupData.members);
      }
    };

    getMembers();
  }, [user, groupName]);

  //just for testing (change it to be dynamic later)
  const exampleInventory = "Bathroom";

  const handleSubmit = async () => {
    setInventoryName("");
    setAddInventoryModal(false);
  };

  const getSuggestions = async () => {
    const selectedInventory = inventories.find(
      (inventory) => inventory.name === exampleInventory
    );

    console.log("selectedInventory", selectedInventory);

    await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedInventory }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('data', data);
        setSuggestedItems({ inventory: exampleInventory, items: data });
      });
  };

  //function to add an room in a group to the database
  const createInventory = async () => {
    if (!inventoryName) {
      alert("Please enter an inventory name");
      return;
    }

    const batch = writeBatch(db);

    const groupRef = doc(collection(db, "groups"), groupName);
    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, inventoryName);
    const inventorySnap = await getDoc(inventoryRef);

    if (inventorySnap.exists()) {
      alert("Inventory already exists");
      return;
    } else {
      await setDoc(inventoryRef, {
        name: inventoryName,
        items: [],
        neededItems: [],
      });
    }
    setInventoryName("");
  };

  const addItem = async () => {
    const groupRef = doc(collection(db, "groups"), groupName);
    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, "Bathroom"); //inventory should be dynamically selected

    //const itemsCollection = collection(inventoryRef, "items");

    //const itemRef = doc(itemsCollection, itemName);
    // const itemSnap = await getDoc(itemRef);

    //this can be adjusted later to add quantity to the item
    const inventorySnap = await getDoc(inventoryRef);

    if (!inventorySnap.exists()) {
      alert("Inventory does not exist");
      return;
    } else {
      const items = inventorySnap.data().items;

      const newItem = {
        name: itemName, // require user to give name
        quantity: 1, //allow user to adjust quantity (default to 1)
        inventory: "Bathroom", // automatically selected based on the inventory selected
        unit: null, // allow user to adjust unit (default to null)
        Category: null, // allow user to adjust category (default to null)
        addedBy: user.firstName + " " + user.lastName, // automatically set to user's full name
        expiryDate: null, // allow  user to adjust expiry date (default to null)
        dateAdded: new Date(), // default to time now
        lastUpdated: new Date(), // default to date added
        isPerishable: false, // allow user to adjust (default to false)
        minimumQuantity: 0, // allow user to specify (default to 0)
        notes: "", // allow user to add notes (default to empty string)
      };

      const newItems = [...items, newItem];
      await updateDoc(inventoryRef, {
        items: newItems,
      });
    }
    setItemName("");
  };

  const addNeededItem = async () => {
    const groupRef = doc(collection(db, "groups"), groupName);
    console.log("groupRef", groupRef);
    const inventoryCollection = collection(groupRef, "inventories");
    console.log("inventoryCollection", inventoryCollection);

    const inventoryRef = doc(inventoryCollection, exampleInventory); //inventory should be dynamically selected
    console.log("inventoryRef", inventoryRef);

    //const itemsCollection = collection(inventoryRef, "items");

    //const itemRef = doc(itemsCollection, itemName);
    // const itemSnap = await getDoc(itemRef);

    //this can be adjusted later to add quantity to the item
    const inventorySnap = await getDoc(inventoryRef);

    if (!inventorySnap.exists()) {
      alert("Inventory does not exist");
      return;
    } else {
      const items = inventorySnap.data().neededItems;
      console.log(" needed items", items);

      const newNeededItem = {
        name: itemName, // require user to give name
        quantityNeeded: 1, // allow user to adjust quantity (default to 1)
        unit: null, // allow user to adjust unit (default to null)
        inventory: "Bathroom", // automatically selected based on the inventory selected
        priority: "Low", // allow user to adjust priority (default to Low)
        assignTo: [`${user.firstName} ${user.lastName}`], // require user to assign to a roommate
        status: "Needed", // automatically set to Needed
        dateAdded: new Date(), // default to time now
        notes: "", // allow user to add notes (default to empty string)
      };

      const newItems = [...items, newNeededItem];
      await updateDoc(inventoryRef, {
        neededItems: newItems,
      });
    }
    setItemName("");
  };

  const deleteItem = async () => {
    const groupRef = doc(collection(db, "groups"), groupName);
    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, exampleInventory); //inventory should be dynamically selected

    //const itemsCollection = collection(inventoryRef, "items");

    //const itemRef = doc(itemsCollection, itemName);
    //const itemSnap = await getDoc(itemRef);

    const inventorySnap = await getDoc(inventoryRef);

    if (!inventorySnap.exists()) {
      alert("Inventory does not exist");
      return;
    } else {
      const items = inventorySnap.data().items;

      const newItems = items.filter((item) => item.name !== itemName);
      await updateDoc(inventoryRef, {
        neededItems: newItems,
      });    }
    setItemName("");
  };

  const deleteInventory = async () => {
    try {
      const groupRef = doc(collection(db, "groups"), groupName);
      const inventoryCollection = collection(groupRef, "inventories");

      const inventoryRef = doc(inventoryCollection, exampleInventory); //inventory should be dynamically selected

      //const itemsCollectionRef = collection(inventoryRef, "items");

      // Fetch all documents in the subcollection
      //const itemsSnap = await getDocs(itemsCollectionRef);

      // Delete each document in the subcollection
      //const deletePromises = itemsSnap.docs.map((doc) => deleteDoc(doc.ref));
      //await Promise.all(deletePromises);

      //console.log("All documents in the subcollection deleted successfully!");

      const inventorySnap = await getDoc(inventoryRef);

      if (inventorySnap.exists()) {
        await deleteDoc(inventoryRef);
      } else {
        alert("Inventory does not exist");
      }
    } catch (error) {
      console.error("Error deleting inventory:", error);
    }
    setInventoryName("");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        const inventoriesCol = collection(
          db,
          "groups",
          groupName,
          "inventories"
        );
        console.log("inventoriesCol", inventoriesCol);

        const inventoriesSnap = await getDocs(inventoriesCol);
        console.log("inventoriesSnap", inventoriesSnap);
        console.log("inventoriesSnap.docs", inventoriesSnap.docs);

        const inventoriesList = [];

        // Collect promises if there are async operations to perform on itemsCol
        const inventoriesPromises = inventoriesSnap.docs.map(
          async (inventory) => {
            const inventoryData = inventory.data();
            console.log("inventory", inventoryData);
            inventoriesList.push(inventoryData);

            const itemsCol = inventoryData.items;
            console.log("itemsCol", itemsCol);
          }
        );

        // Wait for all inventory promises to resolve
        await Promise.all(inventoriesPromises);

        setInventories(inventoriesList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user, groupName]);

  // const handleAddNewMember = async() => {
  //   if (!newMember) {
  //     return;
  //   }

  //   try {
  //     const groupRef = doc(collection(db, "groups"), groupName);
  //     await setDoc(groupRef, {members: [...members, newMember]});
  //     setGroupMembers([...groupMembers, newMember]);
  //     setNewMember('');
  //   } catch (err) {
  //     console.error('Error adding member: ', err);
  //   };
  // }
  const handleInvite = async (event) => {
    if (!email) {
      return;
    }
    const res = await fetch("/api/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Specify the content type
      },
      body: JSON.stringify({ email: email, group: groupName }), // Stringify the email object
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    // Handle response
    console.log(data);
  };

  // Optionally, log the inventories state in a separate useEffect
  useEffect(() => {
    console.log("final inventories", inventories);
  }, [inventories]);

  //Modals open/close
  const handleOpenMemberModal = () => setOpenMemberModal(true);
  const handleCloseMemberModal = () => setOpenMemberModal(false);
  const handleOpenInventoryModal = () => setOpenNewInventoryModal(true);
  const handleCloseInventoryModal = () => setOpenNewInventoryModal(false);
  const handleOpenItemModal = () => setOpenAddItemModal(true);
  const handleCloseItemModal = () => setOpenAddItemModal(false);

  // function to inc

  return (
    <Stack direction="column" alignItems="center" minHeight="100vh">
      {/* Welcome Statement */}
      <Stack direction="column" alignItems="center" width="100%" mt={8} mb={4}>
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
          mb={3}
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
              filter: "blur(3px)",
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
              Welcome *Name* to {groupName}
            </Typography>
          </Box>
        </Box>

        {/* Modal for creating new inventories */}
        <Modal open={openNewInventoryModal} onOpen={handleOpenInventoryModal}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={500}
            bgcolor={green_light}
            border="2px solid #000"
            p={2}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap={3}
            sx={{
              transform: "translate(-50%,-50%)",
            }}
          >
            <Typography variant="h5" textAlign="center">
              Create New Inventory
            </Typography>
            <Stack direction="row" spacing={2}>
              <Box bgcolor="white" border="1px solid black" borderRadius="5px">
                <TextField
                  placeholder="Ex. Bathroom, Kitchen"
                  border="1px solid black"
                  value={inventoryName}
                  onChange={(e) => setInventoryName(e.target.value)}
                />
              </Box>
              <Button
                variant="contained"
                sx={{
                  color: "white",
                  bgcolor: `${green_dark}`,
                  borderRadius: "10px",
                  transition: "200ms",
                  "&:hover": {
                    bgcolor: `${green_dark}`,
                    transform: "scale(1.1)",
                  },
                }}
                onClick={createInventory}
              >
                Create
              </Button>
            </Stack>
            <Button
              variant="contained"
              sx={{
                color: "white",
                bgcolor: `${green_dark}`,
                borderRadius: "10px",
                transition: "200ms",
                "&:hover": {
                  bgcolor: `${green_dark}`,
                  transform: "scale(1.1)",
                },
              }}
              onClick={() => {
                handleCloseInventoryModal();
              }}
            >
              Close
            </Button>
          </Box>
        </Modal>

        <Stack
          width="80%"
          direction="row"
          spacing={2}
        >
          <Stack
            width="100%"
            direction="column"
            spacing={2}
          >
            {/* Search Bar */}
            <Box
              width="100%"
              maxWidth="md"
              maxHeight="90px"
              border="1px solid black"
              borderRadius="20px"
              p={2}
              sx={{ background: `linear-gradient(to left, #fff, ${green_light})` }}
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
                  ),
                }}
              />
            </Box>
            <Stack width="100%" direction="row" spacing={2}>
              <Button
                variant="contained"
                sx={{
                  color: "white",
                  bgcolor: `${green_dark}`,
                  borderRadius: "10px",
                  transition: "200ms",
                  "&:hover": {
                    bgcolor: `${green_dark}`,
                    transform: "scale(1.1)",
                  },
                }}
                onClick={(e) => {
                  handleOpenInventoryModal();
                }}
              >
                Create New Inventory
              </Button>
            </Stack>
          </Stack>
          {/* Roommate Banner and Add Container Button */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="40%"
            maxWidth="lg"
            bgcolor={green_dark}
            borderRadius="20px"
            py={3}
            mb={2}
          >
            {/* invisible icon to balance out justifyContent space-between */}
            <SettingsIcon
              sx={{ ml: 2, fontSize: { xs: 40, sm: 50 }, color: `${green_dark}` }}
            />
            <Box>
              <Typography
                flexGrow={1}
                textAlign="center"
                color={green_light}
                px={2}
                mb={2}
                sx={{ typography: { xs: "h5", sm: "h4" } }}
              >
                Roommates
              </Typography>
              <Stack direction="column" spacing={2}>
                {groupMembers.map((member) => (
                  <Typography textAlign="center" color="white">
                    {member}
                  </Typography>
                ))}
              </Stack>
            </Box>
            <SettingsIcon
              sx={{
                mr: 2,
                fontSize: { xs: 40, sm: 50 },
                color: `${green_light}`,
                transition: "200ms",
                "&:hover": {
                  transform: "rotate(180deg) scale(1.05)",
                },
              }}
              onClick={(e) => {
                handleOpenMemberModal();
              }}
            />
          </Stack>
        </Stack>
      </Stack>
      {/* Inventory Area */}
      <Box
        width="80%"
        maxWidth="xl"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
      >

        {/* Modal for adding new members */}
        <Modal open={openMemberModal} onOpen={handleOpenMemberModal}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={500}
            bgcolor={green_light}
            border="2px solid #000"
            p={2}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap={3}
            sx={{
              transform: "translate(-50%,-50%)",
            }}
          >
            <Typography variant="h5" textAlign="center">
              Edit Group
            </Typography>
            <Stack direction="column" spacing={1}>
              {groupMembers.map((member) => (
                <Chip key={member} label={member} variant="filled" />
              ))}
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                placeholder="New Member Email"
                inputRef={textInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                variant="contained"
                sx={{
                  color: "white",
                  bgcolor: `${green_dark}`,
                  borderRadius: "10px",
                  transition: "200ms",
                  "&:hover": {
                    bgcolor: `${green_dark}`,
                    transform: "scale(1.1)",
                  },
                }}
                onClick={(e) => {
                  textInput.current.value = "";
                  handleInvite();
                }}
              >
                Invite
              </Button>
            </Stack>
            <Button
              variant="contained"
              sx={{
                color: "white",
                bgcolor: `${green_dark}`,
                borderRadius: "10px",
                transition: "200ms",
                "&:hover": {
                  bgcolor: `${green_dark}`,
                  transform: "scale(1.1)",
                },
              }}
              onClick={() => {
                handleCloseMemberModal();
              }}
            >
              Close
            </Button>
          </Box>
        </Modal>

        <Grid
          container
          spacing={2}
          mb={8}
          justifyContent={"center"}
          alignItems="center"
        >
          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="index number"
                id="index number"
                sx={{
                  border: "2px solid red",
                  width: "100%",
                  maxWidth: "100%",
                  textOverflow: "ellipsis",
                }}
              >
                {/* You can use inventory.name*/}
                <Typography
                  color="black"
                  textAlign="center"
                  border={"2px solid blue"}
                  width="100%"
                  sx={{ typography: { xs: "h6", sm: "h5" } }}
                >
                  Item List - {groupName}
                </Typography>
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
                        borderRadius: "15px",
                      },
                      "&:hover::before": {
                        opacity: 1,
                        zIndex: 1,
                        borderRadius: "15px",
                      },
                    }}
                  >
                    {/* You can use groupMembers here*/}
                    <Stack direction="column" zIndex={2}>
                      <Chip
                        label="Andrew"
                        variant="outlined"
                        size="small"
                        sx={{
                          ml: 1,
                          my: 1,
                          background: `linear-gradient(to bottom, lightblue, white)`,
                        }}
                      />
                      <Chip
                        label="Rafik"
                        variant="outlined"
                        size="small"
                        sx={{
                          ml: 1,
                          mb: 1,
                          background: `linear-gradient(to bottom, yellow, white)`,
                        }}
                      />
                    </Stack>
                    <Box zIndex={2}>
                      {/* You can use inventory.items.name here*/}
                      <Typography
                        sx={{
                          display: { xs: "block", sm: "inline" },
                          pr: { xs: 0, sm: 2, md: 3, lg: 3, xl: 4 },
                        }}
                      >
                        Name of item
                      </Typography>
                      {/* You can use inventory.items.quantity here*/}
                      <Typography
                        sx={{
                          display: { xs: "block", sm: "inline" },
                          pl: { xs: 0, sm: 2, md: 3, lg: 3, xl: 4 },
                        }}
                      >
                        # of item
                      </Typography>
                    </Box>
                    <Box zIndex={2}>
                      <TooltipIcon title="Delete" placement="top">
                        {/* You can use deleteItem here (probably pass item.name as parameter)*/}
                        <DeleteOutlineIcon />
                      </TooltipIcon>
                      <TooltipIcon title="-1" placement="top">
                        <RemoveIcon sx={{ mx: { xs: 1 } }} />
                      </TooltipIcon>
                      <TooltipIcon title="+1" placement="top">
                        <AddIcon sx={{ mr: 1 }} />
                      </TooltipIcon>
                    </Box>
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
        <Box>
          <TextField
            label="input"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <Button onClick={getSuggestions}>Add</Button>
        </Box>
      </Box>
    </Stack>
  );
}
