"use client";

import {
  Box,
  Grid,
  Typography,
  Modal,
  Stack,
  TextField,
  InputAdornment,
  InputLabel,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Switch,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import TooltipIcon from "../../Components/tooltipicon";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import { DarkButton, LightButton } from "../../Components/styledbuttons";
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

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// colors
const green_white = "#F3F6F9";
const green_light = "#D3F8CC";
const green_dark = "#4E826B";
const gray_dark = "#1C2025";

export default function Inventory() {
  /****************************************************** States ******************************************************/

  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // Data to be fetched from Firebase
  const [inventories, setInventories] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isLeader, setIsLeader] = useState(false);

  // States for handling functions
  const [search, setSearch] = useState("");
  const [inventoryName, setInventoryName] = useState("");
  const [items, setItems] = useState([]);
  const [neededItems, setNeededItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [email, setEmail] = useState("");
  const [suggestedItems, setSuggestedItems] = useState({});
  const [inventoryNameForDisplay, setInventoryNameForDisplay] = useState("");
  const [inventoryNameForDeletion, setInventoryNameForDeletion] = useState("");

  // Item Metadata
  const [selectedInventory, setSelectedInventory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(null);
  const [category, setCategory] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [isPerishable, setIsPerishable] = useState(false);
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState(0.0);
  const [priority, setPriority] = useState("med");
  const [assignedRoommate, setAssignedRoommate] = useState("");

  //Modals
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [openNewInventoryModal, setOpenNewInventoryModal] = useState(false);
  const [openAddItemModal, setOpenAddItemModal] = useState(false);
  const [openNeededItemModal, setOpenNeededItemModal] = useState(false);
  const [openInventoryModal, setOpenInventoryModal] = useState(false);
  const [openDeleteInventoryModal, setOpenDeleteInventoryModal] = useState(false);

  //Modals open/close
  const handleOpenMemberModal = () => setOpenMemberModal(true);
  const handleCloseMemberModal = () => setOpenMemberModal(false);
  const handleOpenNewInventoryModal = () => setOpenNewInventoryModal(true);
  const handleCloseNewInventoryModal = () => setOpenNewInventoryModal(false);
  const handleOpenItemModal = () => setOpenAddItemModal(true);
  const handleCloseItemModal = () => setOpenAddItemModal(false);
  const handleOpenNeededItemModal = () => setOpenNeededItemModal(true);
  const handleCloseNeededItemModal = () => setOpenNeededItemModal(false);
  const handleOpenInventoryModal = (inventoryName) => {
    setInventoryNameForDisplay(inventoryName);
  };
  const handleCloseInventoryModal = () => setOpenInventoryModal(false);
  const handleOpenDeleteInventoryModal = (inventoryName) => {
    setInventoryNameForDeletion(inventoryName);
    setOpenDeleteInventoryModal(true);
  };
  const handleCloseDeleteInventoryModal = (inventoryName) => {
    setOpenDeleteInventoryModal(false);
    deleteInventory(inventoryName);
  };

  //Filtered objects
  const [filteredInventories, setFilteredInventories] = useState([]);

  // Get group name from URL
  const searchParams = useSearchParams();
  const groupName = searchParams.get("id");

  const textInput = useRef(null);

  //get Username
  const userName = user ? user.firstName + " " + user.lastName : "";

  /****************************************************** Handling Group Members ******************************************************/

  // Function to invite a member to the group (only leader can invite members)
  const handleInvite = async (event) => {
    if (!isLeader) {
      alert("You must be the leader of the group to invite members");
    }
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
  };

  // Function to kick a member from the group (only leader can kick members) (2 READ, 2 WRITE operations)
  const kickMember = async (member) => {
    console.log("kicking member");
    if (!isLeader) {
      alert("You must be the leader of the group to kick members");
    }
    const groupRef = doc(collection(db, "groups"), groupName);
    //READ
    const groupSnap = await getDoc(groupRef);

    if (groupSnap.exists()) {
      const groupData = groupSnap.data();
      const newMembers = groupData.members.filter(
        (groupMember) => groupMember.name !== member
      );

      //WRITE
      await updateDoc(groupRef, {
        members: newMembers,
      });
      setGroupMembers(newMembers);

      const userRef = doc(collection(db, "users"), user.id);
      //READ
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const newGroups = userData.groups.filter(
          (group) => group !== groupName
        );

        //WRITE
        await updateDoc(userRef, {
          groups: newGroups,
        });

        fetchGroups();
      }
    }
  };

  // Function to leave the group (1 READ, 1 WRITE, 1 DELETE operation)
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
    router.push("/dashboard");
  };

  /****************************************************** AI Suggestions ******************************************************/

  //just for testing (change it to be dynamic later)
  const exampleInventory = "Bathroom";

  // Function to get suggestions from the AI
  const getSuggestions = async () => {
    const selectedInventory = inventories.find(
      (inventory) => inventory.name === exampleInventory
    );

    await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedInventory }),
    })
      .then((response) => response.json())
      .then((data) => {
        setSuggestedItems({ inventory: exampleInventory, items: data });
      });
  };

  /****************************************************** Inventory Functions ******************************************************/

  //function to add an inventory in a group to the database (1 READ, WRITE operation)
  const createInventory = useCallback(async () => {
    console.log("creating inventory");
    if (!inventoryName) {
      alert("Please enter an inventory name");
      return;
    }

    const batch = writeBatch(db);

    const groupRef = doc(collection(db, "groups"), groupName);
    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, inventoryName);
    //READ
    const inventorySnap = await getDoc(inventoryRef);

    if (inventorySnap.exists()) {
      alert("Inventory already exists");
      return;
    } else {
      //WRITE
      await setDoc(inventoryRef, {
        name: inventoryName,
        items: [],
        neededItems: [],
      });
      fetchInventories();
    }
    setInventoryName("");
    handleCloseNewInventoryModal();
  }, [inventoryName]);

  //function to delete an inventory in a group from the database (1 READ, 1 DELETE operation)
  const deleteInventory = useCallback(async (inventoryName) => {
    console.log("deleting inventory");
    try {
      const groupRef = doc(collection(db, "groups"), groupName);
      const inventoryCollection = collection(groupRef, "inventories");

      const inventoryRef = doc(inventoryCollection, inventoryName); //inventory should be dynamically selected

      //READ
      const inventorySnap = await getDoc(inventoryRef);

      if (inventorySnap.exists()) {
        //DELETE
        await deleteDoc(inventoryRef);
      } else {
        alert("Inventory does not exist");
      }
    } catch (error) {
      console.error("Error deleting inventory:", error);
    }
    fetchInventories();
    setInventoryName("");
  }, [exampleInventory]);

  /****************************************************** Expense Tracking ******************************************************/

  // Function to add an expense to the group (1 READ, 1 WRITE operation)
  const addExpense = useCallback(async (price) => {
    /*If person bought it:
	      Owe = price/#members - price
      If not:
	      Owe = price/#members
   */

    console.log("adding expense");
    const examplePrice = 10;
    const groupRef = doc(collection(db, "groups"), groupName);
    //READ
    const groupSnap = await getDoc(groupRef);
    const members = groupSnap.data().members;
    const newMembers = members.map((member) => {
      return {
        ...member,
        owe:
          member.owe +
          (member.leader
            ? examplePrice / members.length - examplePrice
            : examplePrice / members.length),
      };
    });

    //WRITE
    await updateDoc(groupRef, { members: newMembers });

    fetchGroups();

    setGroupMembers(newMembers);
  }, []);

  // Function to clear expenses for the group (1 READ, 1 WRITE operation)
  const clearExpenses = async () => {
    const groupRef = doc(collection(db, "groups"), groupName);
    //READ
    const groupSnap = await getDoc(groupRef);
    const members = groupSnap.data().members;
    const newMembers = members.map((member) => {
      return {
        ...member,
        owe: 0,
      };
    });

    //WRITE
    await updateDoc(groupRef, { members: newMembers });

    setGroupMembers(newMembers);
  };

  /****************************************************** Item Functions ******************************************************/

  //function to add an item to the inventory (1 READ, 1 WRITE operation)
  const addItem = useCallback(async () => {
    console.log("adding item");
    const groupRef = doc(collection(db, "groups"), groupName);

    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, exampleInventory); //inventory should be dynamically selected

    //READ
    const inventorySnap = await getDoc(inventoryRef);

    if (!inventorySnap.exists()) {
      alert("Inventory does not exist");
      return;
    } else {
      const items = inventorySnap.data().items;

      const newItem = {
        name: itemName, // require user to give name
        quantity: quantity, //allow user to adjust quantity (default to 1)
        inventory: selectedInventory, // automatically selected based on the inventory selected
        unit: unit, // allow user to adjust unit (default to null)
        price: price, // allow user to adjust price (default to 0)
        addedBy: userName, // automatically set to the user's full name
        Category: category, // allow user to adjust category (default to null)
        expiryDate: expiryDate, // allow  user to adjust expiry date (default to null)
        dateAdded: Date.now(), // default to time now
        lastUpdated: Date.now(), // default to date added
        isPerishable: isPerishable, // allow user to adjust (default to false)
        minimumQuantity: 0, // allow user to specify (default to 0)
        notes: notes, // allow user to add notes (default to empty string)
      };

      const newItems = [...items, newItem];
      //WRITE
      await updateDoc(inventoryRef, {
        items: newItems,
      });

      fetchInventories();
      addExpense(newItem.price);
    }
    setItemName("");
    setQuantity(1);
    setSelectedInventory("");
    setUnit(null);
    setCategory(null);
    setExpiryDate(null);
    setIsPerishable(false);
    setNotes("");
    handleCloseItemModal(false);
  }, []);

  //function to delete an item from the inventory (1 READ, 1 WRITE operation)
  const deleteItem = useCallback(async () => {
    console.log("deleting item");
    const groupRef = doc(collection(db, "groups"), groupName);
    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, exampleInventory); //inventory should be dynamically selected

    //READ
    const inventorySnap = await getDoc(inventoryRef);

    if (!inventorySnap.exists()) {
      alert("Inventory does not exist");
      return;
    } else {
      const items = inventorySnap.data().items;

      const newItems = items.filter((item) => item.name !== itemName);
      //WRITE
      await updateDoc(inventoryRef, {
        neededItems: newItems,
      });

      fetchInventories();
    }
    setItemName("");
  }, []);

  // This function moves the item from the neededItems array to the items array (1 WRITE operation)
  const buyItem = useCallback(async (purchasedItemName) => {
    console.log("Buying item");

    const groupRef = doc(collection(db, "groups"), groupName);
    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, exampleInventory); //inventory should be dynamically selected

    const localInventory = inventories.find(
      (inventory) => inventory.name === exampleInventory
    );

    if (!localInventory) {
      alert("Inventory does not exist");
      return;
    } else {
      let newItem = localInventory.neededItems.find(
        (item) => item.name === purchasedItemName
      );

      if (!newItem) {
        alert("Item not found in shopping list");
        return;
      }

      const items = localInventory.items;

      newItem = {
        name: newItem.name, // require user to give name
        quantity: newItem.quantityNeeded, //allow user to adjust quantity (default to 1)
        inventory: newItem.inventory, // automatically selected based on the inventory selected
        unit: newItem.unit, // allow user to adjust unit (default to null)
        price: 0, // allow user to input price (default to 0)
        addedBy: userName, // automatically set to the user's full name
        Category: category, // allow user to adjust category (default to null)
        expiryDate: expiryDate, // allow  user to adjust expiry date (default to null)
        dateAdded: new Date(), // default to time now
        lastUpdated: new Date(), // default to date added
        isPerishable: isPerishable, // allow user to adjust (default to false)
        minimumQuantity: 0, // allow user to specify (default to 0)
        notes: notes, // allow user to add notes (default to empty string)
      };
      const newItems = [...items, newItem];
      const newNeededItems = neededItems.filter(
        (neededItem) => neededItem.name !== purchasedItemName
      );

      addExpense(newItem.price);

      //WRITE
      await updateDoc(inventoryRef, {
        items: newItems,
        neededItems: newNeededItems,
      });

      fetchInventories();
    }
  }, []);

  /****************************************************** Needed Items Functions ******************************************************/

  //function to add a needed item to the inventory (1 READ, 1 WRITE operation)
  const addNeededItem = useCallback(async () => {
    console.log("adding needed item");
    const groupRef = doc(collection(db, "groups"), groupName);
    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, exampleInventory); //inventory should be dynamically selected

    //READ
    const inventorySnap = await getDoc(inventoryRef);

    if (!inventorySnap.exists()) {
      alert("Inventory does not exist");
      return;
    } else {
      const items = inventorySnap.data().neededItems;

      const newNeededItem = {
        name: itemName, // require user to give name
        quantityNeeded: quantity, // allow user to adjust quantity (default to 1)
        unit: unit, // allow user to adjust unit (default to null)
        inventory: selectedInventory, // automatically selected based on the inventory selected
        priority: priority, // allow user to adjust priority (default to Low)
        assignTo: assignedRoommate, // require user to assign to a roommate
        linksOnline: [], // allow user to add links (default to empty array)
        status: "Needed", // automatically set to Needed
        dateAdded: new Date(), // default to time now
        notes: notes, // allow user to add notes (default to empty string)
      };

      const newItems = [...items, newNeededItem];
      //WRITE
      await updateDoc(inventoryRef, {
        neededItems: newItems,
      });

      fetchInventories();
    }
    setItemName("");
  }, []);

  /****************************************************** Use Effects ******************************************************/

  //fetching inventory data (1 READ operation)
  const fetchInventories = useCallback(async () => {
    console.log("fetching inventories from DB");
    try {
      if (!user) return;

      const inventoriesCol = collection(db, "groups", groupName, "inventories");

      //READ
      const inventoriesSnap = await getDocs(inventoriesCol);

      const inventoriesList = [];

      // Collect promises if there are async operations to perform on itemsCol
      const inventoriesPromises = inventoriesSnap.docs.map(
        async (inventory) => {
          const inventoryData = inventory.data();
          inventoriesList.push(inventoryData);

          const itemsCol = inventoryData.items;
        }
      );

      // Wait for all inventory promises to resolve
      await Promise.all(inventoriesPromises);

      setInventories(inventoriesList);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [user, groupName]);

  useEffect(() => {
    console.log("fetching inventories from UseEffect");
    fetchInventories();
    console.log("inventories", inventories);
  }, [user, groupName]);

  // Fetching group data (1 READ operation)
  const fetchGroups = useCallback(async () => {
    console.log("fetching group & user from DB");
    try {
      const groupRef = doc(db, "groups", groupName);
      //READ
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const member = groupData.members.find(
          (member) => member.name === userName
        );
        const leaderState = member ? member.leader : false;
        setIsLeader(leaderState);
        setGroupMembers(groupData.members);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [user, groupName]);

  // Fetching group data (1 READ operation)
  useEffect(() => {
    console.log("fetching groups from UseEffect");
    fetchGroups();
    console.log("groupMembers", groupMembers);
  }, [user, groupName]);

  // Filtering inventories based on search term
  useEffect(() => {
    console.log("Filtering groups");
    setFilteredInventories(inventories.filter(inventory =>
      inventory.name.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, inventories]);

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
            {user ? (
              <Typography
                textAlign="center"
                color={green_white}
                sx={{ typography: { xs: "h5", sm: "h4" } }}
              >
                Welcome {user.firstName} to {groupName}
              </Typography>
            ) : null}
          </Box>
        </Box>

        {/* Modal for creating new inventories */}
        <Modal open={openNewInventoryModal}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width="80%"
            maxWidth="sm"
            bgcolor={green_light}
            border="2px solid #000"
            borderRadius="20px"
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
            <CloseIcon
              sx={{
                position: "absolute",
                top: 5,
                left: 5,
                fontSize: 40,
                color: `${green_dark}`,
                transition: "200ms",
                "&:hover": {
                  cursor: "pointer",
                  transform: "rotate(180deg) scale(1.05)",
                },
              }}
              onClick={(e) => {
                handleCloseNewInventoryModal(false);
              }}
            />
            <Typography variant="h5" textAlign="center" width="80%">
              Create New Inventory
            </Typography>
            <TextField
              size="small"
              placeholder="Ex. Bathroom, Kitchen"
              border="1px solid black"
              value={inventoryName}
              onChange={(e) => setInventoryName(e.target.value)}
              sx={{ bgcolor: "white" }}
            />
            <Box onClick={createInventory}>
              <DarkButton>Create</DarkButton>
            </Box>
          </Box>
        </Modal>

        {/* Modal for adding new items */}
        <Modal open={openAddItemModal}>
          <Stack
            position="absolute"
            top="50%"
            left="50%"
            width="80%"
            maxWidth="sm"
            bgcolor={green_light}
            border="2px solid #000"
            borderRadius="20px"
            p={2}
            gap={2}
            direction="column"
            justifyContent="center"
            alignItems="center"
            sx={{
              transform: "translate(-50%,-50%)",
            }}
          >
            <CloseIcon
              sx={{
                position: "absolute",
                top: 5,
                left: 5,
                fontSize: 40,
                color: `${green_dark}`,
                transition: "200ms",
                "&:hover": {
                  cursor: "pointer",
                  transform: "rotate(180deg) scale(1.05)",
                },
              }}
              onClick={(e) => {
                handleCloseItemModal();
              }}
            />
            <Typography variant="h5" textAlign="center">
              Add New Item
            </Typography>
            <TextField
            size="small"
              placeholder="Name"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{ bgcolor: "white", width: "80%" }}
            />
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
              width="80%"
            >
              <Typography>Quantity:</Typography>
              <TextField
                size="small"
                placeholder="Quantity"
                border="1px solid black"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                sx={{ bgcolor: "white", width: "50%" }}
              />
              <Typography textAlign="center">
                X
              </Typography>
              <TextField
                size="small"
                placeholder="Unit"
                border="1px solid black"
                inputMode="numeric"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                sx={{ bgcolor: "white", width: "50%" }}
              />
            </Stack>
            <Stack direction="row" justifyContent="center" alignItems="center" width="80%">
              <Typography color="black" mr={1} width="20%">Price:</Typography>
              <TextField
                size="small"
                border="1px solid black"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment sx={{ mr: 1 }}>$</InputAdornment>
                  ),
                }}
                sx={{ bgcolor: "white", width: "80%" }}
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" width="80%">
              <FormControl sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <FormLabel sx={{ textAlign: "center" }}>Perishable?</FormLabel>
                <RadioGroup
                  defaultValue="No"
                  value={isPerishable}
                  onChange={(e) => setIsPerishable(e.target.value)}
                  sx={{ ml: 2 }}
                >
                  <FormControlLabel
                    value={true}
                    control={<Radio size="small" />}
                    label="Yes"
                  />
                  <FormControlLabel
                    value={false}
                    control={<Radio size="small" />}
                    label="No"
                  />
                </RadioGroup>
              </FormControl>
              <TextField
                size="small"
                placeholder="Exp. Date"
                border="1px solid black"
                inputMode="numeric"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                sx={{ bgcolor: "white", width: "60%" }}
              />
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="center"
              width="80%"
            >
              <Typography color="black" width="40%">Select Inventory:</Typography>
              <Box bgcolor="white" color="black" width="60%">
                <FormControl fullWidth InputLabelProps={{shrink: false}}>
                  <Select
                    size="small"
                    value={selectedInventory}
                    sx={{ color: "black" }}
                    onChange={(e) => setSelectedInventory(e.target.value)}
                  >
                    {inventories.map((inventory) => (
                      <MenuItem key={inventory.name} value={inventory.name}>
                        {inventory.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
            <TextField
              multiline
              placeholder="Add notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ bgcolor: "white", width: "80%" }}
            />

            <Box onClick={addItem}>
              <DarkButton>Add New Item</DarkButton>
            </Box>
          </Stack>
        </Modal>

        {/* Modal for adding needed items */}
        <Modal open={openNeededItemModal}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width="80%"
            maxWidth="sm"
            bgcolor={green_light}
            border="2px solid #000"
            borderRadius="20px"
            p={2}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap={2}
            sx={{
              transform: "translate(-50%,-50%)",
            }}
          >
             <CloseIcon
              sx={{
                position: "absolute",
                top: 5,
                left: 5,
                fontSize: 40,
                color: `${green_dark}`,
                transition: "200ms",
                "&:hover": {
                  cursor: "pointer",
                  transform: "rotate(180deg) scale(1.05)",
                },
              }}
              onClick={(e) => {
                handleCloseNeededItemModal();
              }}
            />
            <Typography variant="h5" textAlign="center">
              Add to Shopping List
            </Typography>
            
            <TextField
              size="small"
              placeholder="Name"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{ bgcolor: "white", width: "80%" }}
            />
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
              width="80%"
            >
              <Typography>Quantity:</Typography>
              <TextField
                size="small"
                placeholder="Quantity"
                border="1px solid black"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                sx={{ bgcolor: "white", width: "50%" }}
              />
              <Typography color="black" textAlign="center">
                X
              </Typography>
              <TextField
                size="small"
                placeholder="Unit"
                border="1px solid black"
                inputMode="numeric"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                sx={{ bgcolor: "white", width: "50%" }}
              />
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              width="80%"
            >
              <Typography color="black" mr={1}>Price:</Typography>
              <TextField
                size="small"
                border="1px solid black"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment sx={{ mr: 1 }}>$</InputAdornment>
                  ),
                }}
                sx={{ bgcolor: "white", width: "60%" }}
              />

              <Stack direction="row" alignItems="center">
                <Typography color="black" textAlign="center" mx={1}>
                  Priority:
                </Typography>
                <Box bgcolor="white" width="60%">
                  <FormControl fullWidth InputLabelProps={{shrink: false}}>
                    <Select
                      size="small"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <MenuItem value={"high"}>High</MenuItem>
                      <MenuItem value={"med"}>Med</MenuItem>
                      <MenuItem value={"low"}>Low</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              width="80%"
            >
              <Typography width="30%">Select Inventory:</Typography>
              <Box bgcolor="white" color="black" width="70%">
                <FormControl fullWidth InputLabelProps={{shrink: false}}>
                  <Select
                    size="small"
                    value={selectedInventory}
                    onChange={(e) => setSelectedInventory(e.target.value)}
                  >
                    {inventories.map((inventory) => (
                      <MenuItem key={inventory.name} value={inventory.name}>
                        {inventory.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              width="80%"
            >
              <Typography width="30%">Assign To:</Typography>
              <Box bgcolor="white" color="black" width="70%">
                <FormControl fullWidth InputLabelProps={{shrink: false}}>
                  <Select
                    size="small"
                    value={assignedRoommate}
                    sx={{ color: "black" }}
                    onChange={(e) => setAssignedRoommate(e.target.value)}
                  >
                    {groupMembers.map((member) => (
                      <MenuItem key={member.name} value={member.name}>{member.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
            <Box bgcolor="white" width="60%">
              <TextField
                multiline
                fullWidth
                placeholder="Add notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
            <Box onClick={addNeededItem} display="flex" justifyContent="center" width="30%">
              <DarkButton>Add to List</DarkButton>
            </Box>
          </Box>
        </Modal>

        {/* Roommate Banner and Search & Add Functionality */}
        <Box width="80%" maxWidth="lg" my={3}>
          <Grid container flexGrow={1} spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack
                direction="column"
                justifyContent="space-around"
                alignItems="center"
                height="100%"
                bgcolor={green_dark}
                borderRadius="20px"
                position="relative"
                py={3}
              >
                <Typography
                  variant="h4"
                  textAlign="center"
                  color={green_light}
                  mb={2}
                >
                  Roommates
                </Typography>
                <Stack direction="column" spacing={2}>
                  {groupMembers.map((member) => (
                    <Typography key={member.name} textAlign="center" color="white">
                      {member.name}
                    </Typography>
                  ))}
                </Stack>
                <SettingsIcon
                  sx={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    fontSize: 40,
                    color: `${green_light}`,
                    transition: "200ms",
                    "&:hover": {
                      cursor: "pointer",
                      transform: "rotate(180deg) scale(1.05)",
                    },
                  }}
                  onClick={(e) => {
                    handleOpenMemberModal();
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box height="100%">
                <Box
                  maxWidth="md"
                  maxHeight="90px"
                  border="1px solid black"
                  borderRadius="20px"
                  p={2}
                  mb={2}
                  sx={{
                    background: `linear-gradient(to left, #fff, ${green_light})`,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Search Inventory"
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
                <Stack
                  width="100%"
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                >
                  <Box onClick={(e) => {handleOpenNewInventoryModal();}}>
                    <DarkButton>Create Inventory</DarkButton>
                  </Box>
                  <Box onClick={(e) => {handleOpenItemModal();}}>
                    <DarkButton>Add Item</DarkButton>
                  </Box>
                  <Box onClick={(e) => {handleOpenNeededItemModal();}}>
                    <DarkButton>Add To Shopping List</DarkButton>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Stack>

      {/* Modal for adding new members */}
      <Modal open={openMemberModal}>
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
          <CloseIcon
            sx={{
              position: "absolute",
              top: 5,
              left: 5,
              fontSize: 40,
              color: `${green_dark}`,
              transition: "200ms",
              "&:hover": {
                cursor: "pointer",
                transform: "rotate(180deg) scale(1.05)",
              },
            }}
            onClick={() => {
              handleCloseMemberModal();
            }}
          />
          <Typography variant="h5" textAlign="center">
            Edit Group
          </Typography>
          <Stack direction="column" spacing={1}>
            {groupMembers.map((member) => (
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip key={member.name} label={member.name} variant="filled" />
                <TooltipIcon title="Remove" placement="top">
                  <DeleteOutlineIcon />
                </TooltipIcon>
              </Stack>
            ))}
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="New Member Email"
              inputRef={textInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ bgcolor: "white" }}
            />
            <Box
              onClick={(e) => {
                textInput.current.value = "";
                handleInvite();
              }}
              display="flex"
              justifyContent="center"
            >
              <DarkButton>Invite</DarkButton>
            </Box>
          </Stack>
        </Box>
      </Modal>

      {/* Inventory Area */}
      <Box width="80%" maxWidth="xl" flexGrow={1}>
        <Grid
          container
          spacing={2}
          mb={8}
        >
          {filteredInventories.map((inventory) => (
            <Grid item key={inventory.name} xs={12} sm={12} md={12} lg={6} xl={6}>
              <Box
                position="relative"
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
                onClick={() => handleOpenInventoryModal(inventory.name)}
                sx={{
                  transition: "500ms",
                  "&:hover": {
                    transform: "scale(1.02)",
                    bgcolor: `${green_dark}`,
                    color: `${green_light}`,
                    cursor: "pointer",
                    "& .deleteIconInventory": {
                      color: `${green_light}`,
                    },
                  },
                }}
              >
                <CloseIcon
                  className="deleteIconInventory"
                  sx={{
                    position: "absolute",
                    top: 5,
                    left: 5,
                    fontSize: 40,
                    color: `${green_dark}`,
                    transition: "200ms",
                    "&:hover": {
                      cursor: "pointer",
                      color: `${green_light}`,
                      transform: "rotate(180deg) scale(1.05)",
                    },
                  }}
                  onClick={() => {
                    handleOpenDeleteInventoryModal(inventory.name);
                  }}
                />
                <Typography
                  variant="h6"
                  maxHeight="100%"
                  width="90%"
                  overflow="auto"
                  textAlign="center"
                  sx={{ overflowWrap: "break-word", '&:hover': { cursor: "pointer" }}}
                >
                  {inventory.name}
                </Typography>
                
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Modal for Inventory Deletion */}
      <Modal open={openDeleteInventoryModal}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width="50%"
          maxWidth="sm"
          bgcolor={green_light}
          border="2px solid #000"
          borderRadius="20px"
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
          <CloseIcon
            sx={{
              position: "absolute",
              top: 5,
              left: 5,
              fontSize: 40,
              color: `${green_dark}`,
              transition: "200ms",
              "&:hover": {
                cursor: "pointer",
                transform: "rotate(180deg) scale(1.05)",
              },
            }}
            onClick={() => {
              handleCloseDeleteInventoryModal(false);
            }}
          />
          <Typography variant="h4">Inventory Deletion</Typography>
          <Typography>Are you sure you want to delete {inventoryNameForDeletion} and all its contents?</Typography>
          <Box onClick={() => handleCloseDeleteInventoryModal(inventoryNameForDeletion)}>
            <DarkButton>Delete</DarkButton>
          </Box>
        </Box>
      </Modal>


      {/* Modal that display's inventory items */}
      <Modal open={openInventoryModal}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width="80%"
          maxWidth="md"
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
          <CloseIcon
            sx={{
              position: "absolute",
              top: 5,
              left: 5,
              fontSize: 40,
              color: `${green_dark}`,
              transition: "200ms",
              "&:hover": {
                cursor: "pointer",
                transform: "rotate(180deg) scale(1.05)",
              },
            }}
            onClick={() => {
              handleCloseInventoryModal();
            }}
          />
          <Typography>{inventoryNameForDisplay}</Typography>
        </Box>
      </Modal>
        {/* <Accordion>
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                  aria-controls="index number"
                  id="index number"
                  sx={{
                    width: "100%",
                    maxWidth: "100%",
                    textOverflow: "ellipsis",
                  }}
                >
                  // You can use inventory.name
                  <Typography
                    color="black"
                    textAlign="center"
                    width="100%"
                    sx={{ typography: { xs: "h6", sm: "h5" } }}
                  >
                    {inventory.name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack direction="column">
                     below is an inventory item 
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
                      {/* You can use groupMembers here
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
                        {/* You can use inventory.items.name here
                        <Typography
                          sx={{
                            display: { xs: "block", sm: "inline" },
                            pr: { xs: 0, sm: 2, md: 3, lg: 3, xl: 4 },
                          }}
                        >
                          Name of item
                        </Typography>
                        {/* You can use inventory.items.quantity here
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
                          {/* You can use deleteItem here (probably pass item.name as parameter)
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
              </Accordion> */}
    </Stack>
  );
}
