"use client";

import React from "react";
import {
  Box,
  Grid,
  Typography,
  Modal,
  Stack,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  Tooltip,
  Paper,
  NativeSelect
} from "@mui/material";
import TooltipIcon from "../../Components/tooltipicon";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PaidIcon from "@mui/icons-material/Paid";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckIcon from "@mui/icons-material/Check";
import StarsSharpIcon from "@mui/icons-material/StarsSharp";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import EditIcon from '@mui/icons-material/Edit';
import {
  DarkButton,
  LightButton,
  DarkButtonSimple,
} from "../../Components/styledbuttons";
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
import { isEmptyObj } from "openai/core";

// colors
const green_white = "#F3F6F9";
const green_light = "#D3F8CC";
const green_extra_light = "#e9fce6";
const green_dark = "#4E826B";
const gray_dark = "#1C2025";

export default function Inventory() {
  /****************************************************** States ******************************************************/

  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  //Group Members Info
  const [expandedMember, setExpandedMember] = useState({
    expanded: false,
    name: "",
  });

  //Group ID
  const [groupID, setGroupID] = useState("");

  // Data to be fetched from Firebase
  const [inventories, setInventories] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isLeader, setIsLeader] = useState(false);

  // States for handling functions
  //search function
  const [inventorySearch, setInventorySearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  //
  const [inventoryName, setInventoryName] = useState("");
  //const [items, setItems] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [neededItemList, setNeededItemList] = useState([]);
  const [email, setEmail] = useState("");
  const [suggestedItems, setSuggestedItems] = useState({});
  const [inventoryNameForDisplay, setInventoryNameForDisplay] = useState("");
  const [inventoryNameForDeletion, setInventoryNameForDeletion] = useState("");
  const [kickedMember, setKickedMember] = useState("");
  const [inventoryNameForShopping, setInventoryNameForShopping] = useState("");

  // Item Metadata
  const [itemName, setItemName] = useState("");
  const [selectedInventory, setSelectedInventory] = useState("");
  const [unit, setUnit] = useState("");
  const [notes, setNotes] = useState("");
  //special item metadata
  const [price, setPrice] = useState(0);
  const [expiryDate, setExpiryDate] = useState("");
  const [isPerishable, setIsPerishable] = useState(false);
  const [minimumQuantity, setMinimumQuantity] = useState(0);
  const [quantity, setQuantity] = useState(1);
  //special needed item metadata
  const [priority, setPriority] = useState("Medium");
  const [assignedRoommate, setAssignedRoommate] = useState("");
  const [linksOnline, setLinksOnline] = useState([]);
  const [status, setStatus] = useState("Needed");
  const [quantityNeeded, setQuantityNeeded] = useState(1);

  //Modals
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [openNewInventoryModal, setOpenNewInventoryModal] = useState(false);
  const [openAddItemModal, setOpenAddItemModal] = useState(false);
  const [openNeededItemModal, setOpenNeededItemModal] = useState(false);
  const [openInventoryModal, setOpenInventoryModal] = useState(false);
  const [openDeleteInventoryModal, setOpenDeleteInventoryModal] =
    useState(false);
  const [openLeaveGroupModal, setOpenLeaveGroupModal] = useState(false);
  const [openKickMemberModal, setOpenKickMemberModal] = useState(false);
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [openShoppingListModal, setOpenShoppingListModal] = useState(false);
  const [openEditItemModal, setOpenEditItemModal] = useState(false);

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
    fetchItemsFromInventory(inventoryName);
    setOpenInventoryModal(true);
  };
  const handleCloseInventoryModal = () => {setOpenInventoryModal(false); setItemSearch("");};
  const handleOpenDeleteInventoryModal = (inventoryName) => {
    setInventoryNameForDeletion(inventoryName);
    setOpenDeleteInventoryModal(true);
  };
  const handleCloseDeleteInventoryModal = (inventoryName) => {
    setOpenDeleteInventoryModal(false);
    deleteInventory(inventoryName);
  };
  const handleOpenLeaveGroupModal = () => setOpenLeaveGroupModal(true);
  const handleCloseLeaveGroupModal = () => setOpenLeaveGroupModal(false);
  const handleOpenKickMemberModal = () => setOpenKickMemberModal(true);
  const handleCloseKickMemberModal = () => setOpenKickMemberModal(false);
  const handleOpenExpenseModal = () => setOpenExpenseModal(true);
  const handleCloseExpenseModal = () => setOpenExpenseModal(false);
  const handleOpenShoppingListModal = () => setOpenShoppingListModal(true);
  const handleCloseShoppingListModal = () => {
    setSuggestedItems({});
    setItemSearch("");
    setOpenShoppingListModal(false);
  };
  const handleOpenEditItemModal = () => setOpenEditItemModal(true);
  const handleCloseEditItemModal = () => setOpenEditItemModal(false);

  //Filtered objects
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredNeededItems, setFilteredNeededItems] = useState([]);

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
    const groupRef = doc(collection(db, "groups"), groupID);
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

      const updatedMembers = newMembers.map((member) => ({
        ...member, // Spread the existing member properties
        expanded: false, // Add or update the 'expanded' field
      }));

      setGroupMembers(updatedMembers);

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

  // Function to delete a group from the database (n READ, n WRITE)
  const deleteGroup = async (group, batch) => {
    console.log("Deleting group");
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

  // Function to leave the group (1 READ, 1 WRITE, 1 DELETE operation)
  const leaveGroup = async () => {
    console.log("leaving group");
    const userDocRef = doc(collection(db, "users"), user.id);

    const groupDocRef = doc(collection(db, "groups"), groupID);

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
          await deleteGroup(groupID, batch);
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

  // Function to get suggestions from the AI
  const getSuggestions = async (passedInventory) => {
    console.log("getting suggestions");

    const localInventory = inventories.find(
      (inventory) => inventory.name === passedInventory
    );

    console.log("localInventory", localInventory);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ localInventory }),
    });

    const data = await response.json();
    setSuggestedItems({ inventory: passedInventory, items: data });
  };

  // Use useEffect to observe suggestedItems after it's updated
  useEffect(() => {
    console.log("suggesteditems in page.js", suggestedItems);
  }, [suggestedItems]);

  const acceptSuggestion = async (passedInventory, passedItem) => {
    console.log("accepting suggestion");
    try {
      const groupRef = doc(collection(db, "groups"), groupID);
      const inventoryCollection = collection(groupRef, "inventories");

      const inventoryRef = doc(inventoryCollection, passedInventory); //inventory should be dynamically selected

      //READ
      const inventorySnap = await getDoc(inventoryRef);

      if (!inventorySnap.exists()) {
        alert("Inventory does not exist");
        return;
      } else {
        const suggestedItem = suggestedItems.items.find(
          (item) => item.name === passedItem
        );

        const newNeededItem = {
          name: passedItem, // require user to give name
          quantityNeeded: suggestedItem.quantityNeeded, // allow user to adjust quantity (default to 1)
          unit: suggestedItem.unit, // allow user to adjust unit (default to null)
          inventory: passedInventory, // automatically selected based on the inventory selected
          priority: suggestedItem.priority, // allow user to adjust priority (default to Low)
          assignTo: "", // require user to assign to a roommate
          linksOnline: [], // allow user to add links (default to empty array)
          status: "Needed", // automatically set to Needed
          dateAdded: new Date(), // default to time now
          notes: suggestedItem.notes, // allow user to add notes (default to empty string)
        };

        const newNeededItems = [...neededItemList, newNeededItem];

        //WRITE
        await updateDoc(inventoryRef, {
          neededItems: newNeededItems,
        });

        setNeededItemList(newNeededItems);

        const remainingSuggestions = suggestedItems.items.filter(
          (item) => item.name !== passedItem
        );
        setSuggestedItems({inventory: passedInventory, items: remainingSuggestions});

        //fetchInventories();
      }
    } catch (error) {
      console.error("Error accepting suggestion: ", error);
    }
  };

  const rejectSuggestion = async (passedItem) => {
    console.log("rejecting suggestion");
    const remainingSuggestions = suggestedItems.items.filter((item) => item.name !== passedItem);
    setSuggestedItems({inventory: inventoryNameForShopping, items: remainingSuggestions});
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

    const groupRef = doc(collection(db, "groups"), groupID);
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
  }, [inventoryName, groupID]);

  //function to delete an inventory in a group from the database (1 READ, 1 DELETE operation)
  const deleteInventory = useCallback(async () => {
    console.log("deleting inventory");
    try {
      const groupRef = doc(collection(db, "groups"), groupID);
      const inventoryCollection = collection(groupRef, "inventories");

      const inventoryRef = doc(inventoryCollection, inventoryNameForDeletion); //inventory should be dynamically selected

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
  }, [inventoryNameForDeletion, groupID]);

  /****************************************************** Expense Tracking ******************************************************/

  // Function to add an expense to the group (1 READ, 1 WRITE operation)
  const addExpense = useCallback(
    async (passedPrice) => {
      /*If person bought it:
	      Owe = price/#members - price
      If not:
	      Owe = price/#members
   */

      console.log("adding expense");

      const groupRef = doc(collection(db, "groups"), groupID);

      const newMembers = groupMembers.map((member) => {
        return {
          ...member,
          owe:
            member.owe +
            (member.name === userName
              ? passedPrice / groupMembers.length - passedPrice
              : passedPrice / groupMembers.length),
        };
      });

      //WRITE
      await updateDoc(groupRef, { members: newMembers });

      const updatedMembers = newMembers.map((member) => ({
        ...member, // Spread the existing member properties
        expanded: false, // Add or update the 'expanded' field
      }));

      fetchGroups();

      setGroupMembers(updatedMembers);
    },
    [price, groupMembers, groupID]
  );

  // Function to clear expenses for the group (1 READ, 1 WRITE operation)
  const clearExpenses = async () => {
    if (!isLeader) {
      alert("You must be the leader of the group to clear expenses!");
    }

    const groupRef = doc(collection(db, "groups"), groupID);
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

    const updatedMembers = newMembers.map((member) => ({
      ...member, // Spread the existing member properties
      expanded: false, // Add or update the 'expanded' field
    }));

    setGroupMembers(updatedMembers);
  };

  /****************************************************** Item Functions ******************************************************/

  //function to add an item to the inventory (1 READ, 1 WRITE operation)
  const addItem = useCallback(async () => {
    console.log("adding item");

    if (!itemName.trim()) {
      alert("Item Name is required");
      return;
    }

    if (!selectedInventory.trim()) {
      alert("Inventory must be selected");
      return;
    }

    if (!quantity || quantity <= 0) {
      alert("Quantity must be a positive number");
      return;
    }

    if (price < 0) {
      alert("Price must be a non-negative number");
      return;
    }

    const groupRef = doc(collection(db, "groups"), groupID);

    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, selectedInventory); //inventory should be dynamically selected

    //READ
    const inventorySnap = await getDoc(inventoryRef);

    const itemExists = inventorySnap
      .data()
      .items.find((item) => item.name === itemName);

    if (itemExists) {
      alert("Item already exists");
      return;
    }

    if (!inventorySnap.exists()) {
      alert("Inventory does not exist");
      return;
    } else {
      const localItems = inventorySnap.data().items;

      const newItem = {
        name: itemName, // require user to give name
        quantity: parseInt(quantity), //allow user to adjust quantity (default to 1)
        inventory: selectedInventory, // automatically selected based on the inventory selected
        unit: unit, // allow user to adjust unit (default to null)
        price: parseFloat(price), // allow user to adjust price (default to 0)
        addedBy: userName, // automatically set to the user's full name
        expiryDate: expiryDate, // allow  user to adjust expiry date (default to null)
        dateAdded: new Date(), // default to time now
        lastUpdated: new Date(), // default to date added
        isPerishable: isPerishable, // allow user to adjust (default to false)
        minimumQuantity: 0, // allow user to specify (default to 0)
        notes: notes.trim(), // allow user to add notes (default to empty string)
      };

      const newItems = [...localItems, newItem];
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
    setPrice(0);
    setUnit("");
    setExpiryDate("");
    setIsPerishable(false);
    setMinimumQuantity(0);
    setNotes("");
    handleCloseItemModal();
  }, [
    selectedInventory,
    itemName,
    quantity,
    unit,
    expiryDate,
    isPerishable,
    notes,
    price,
    minimumQuantity,
    groupID,
  ]);

  //function to delete an item from the inventory (1 READ, 1 WRITE operation)
  const deleteItem = useCallback(
    async (passedInventory, passedItem, isNeeded) => {
      console.log("deleting item");
      try {
        const groupRef = doc(collection(db, "groups"), groupID);
        const inventoryCollection = collection(groupRef, "inventories");

        const inventoryRef = doc(inventoryCollection, passedInventory); //inventory should be dynamically selected

        //READ
        const inventorySnap = await getDoc(inventoryRef);

        if (!inventorySnap.exists()) {
          alert("Inventory does not exist");
          return;
        } else {
          const localItems = isNeeded
            ? inventorySnap.data().neededItems
            : inventorySnap.data().items;

          const newItems = localItems.filter((item) => item.name !== passedItem);
          //WRITE
          if (isNeeded) {
            await updateDoc(inventoryRef, {
              neededItems: newItems,
            });
            setNeededItemList(newItems);
          } else {
            await updateDoc(inventoryRef, {
              items: newItems,
            });
            setItemList(newItems);
          }
        }
      } catch (error) {
        console.error("Error deleting item: ", error);
      }
      fetchInventories();
      setItemName("");
    },
    [groupID]
  );

  // This function moves the item from the neededItems array to the items array (1 WRITE operation)
  const buyItem = useCallback(
    async (purchasedItemInventory, purchasedItemName) => {
      console.log("Buying item");

      const groupRef = doc(collection(db, "groups"), groupID);
      const inventoryCollection = collection(groupRef, "inventories");

      const inventoryRef = doc(inventoryCollection, purchasedItemInventory); //inventory should be dynamically selected

      const localInventory = inventories.find(
        (inventory) => inventory.name === purchasedItemInventory
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

        const localItems = localInventory.items;

        newItem = {
          name: newItem.name, // require user to give name
          quantity: newItem.quantityNeeded, //allow user to adjust quantity (default to 1)
          inventory: newItem.inventory, // automatically selected based on the inventory selected
          unit: newItem.unit, // allow user to adjust unit (default to null)
          price: 0, // allow user to input price (default to 0)
          addedBy: userName, // automatically set to the user's full name
          expiryDate: expiryDate, // allow  user to adjust expiry date (default to null)
          dateAdded: new Date(), // default to time now
          lastUpdated: new Date(), // default to date added
          isPerishable: isPerishable, // allow user to adjust (default to false)
          minimumQuantity: 0, // allow user to specify (default to 0)
          notes: notes.trim(), // allow user to add notes (default to empty string)
        };
        const newItems = [...localItems, newItem];
        const newNeededItems = neededItemList.filter(
          (neededItem) => neededItem.name !== purchasedItemName
        );

        addExpense(newItem.price);

        //WRITE
        await updateDoc(inventoryRef, {
          items: newItems,
          neededItems: newNeededItems,
        });

        setItemList(newItems);
        setNeededItemList(newNeededItems);

        fetchInventories();
      }
    },
    [groupID, neededItemList, itemList, inventories]
  );

  const fetchItemsFromInventory = useCallback(
    async (passedInventory) => {
      console.log("setting items");

      /*
    const groupRef = doc(collection(db, "groups"), groupID);

    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, passedInventory);

    //READ
    const inventorySnap = await getDoc(inventoryRef);

    if (!inventorySnap.exists()) {
      alert("Inventory does not exist");
      return;
    } else {
      setItems(inventorySnap.data().items);
    }
      */
      const localInventory = inventories.find(
        (inventory) => inventory.name === passedInventory
      );

    },
    [inventories, groupID]
  );

  const editQuantity = useCallback(
    async (passedInventory, passedItem, amount, isNeeded) => {
      console.log("increasing quantity");
      console.log(passedInventory);
      try {
        const groupRef = doc(collection(db, "groups"), groupID);
        const inventoryCollection = collection(groupRef, "inventories");

        const inventoryRef = doc(inventoryCollection, passedInventory); //inventory should be dynamically selected

        //READ
        const inventorySnap = await getDoc(inventoryRef);

        if (!inventorySnap.exists()) {
          alert("Inventory does not exist");
          return;
        } else {
          const localItems = isNeeded
            ? inventorySnap.data().neededItems
            : inventorySnap.data().items;

          if (isNeeded) {
            const newItems = localItems.map((item) => {
              if (item.name === passedItem) {
                if (item.quantityNeeded + amount < 0) {
                  alert("Quantity cannot be negative");
                  return item;
                }
                return {
                  ...item,
                  quantityNeeded: item.quantityNeeded + amount,
                };
              } else {
                return item;
              }
            });

            await updateDoc(inventoryRef, {
              neededItems: newItems,
            });
            setNeededItemList(newItems);
          } else {
            const newItems = localItems.map((item) => {
              if (item.name === passedItem) {
                if (item.quantity + amount < 0) {
                  alert("Quantity cannot be negative");
                  return item;
                }
                return { ...item, quantity: item.quantity + amount };
              } else {
                return item;
              }
            });
            await updateDoc(inventoryRef, {
              items: newItems,
            });
            setItemList(newItems);
          }
          //WRITE

          // fetchInventories();
        }
      } catch (error) {
        console.error("Error increasing quantity: ", error);
      }
      fetchInventories();
    },
    [groupID]
  );

  const editItem = useCallback(
    async (passedInventory, passedItem, isNeeded) => {
      console.log("increasing quantity");
      console.log(passedInventory);
      try {
        const groupRef = doc(collection(db, "groups"), groupID);
        const inventoryCollection = collection(groupRef, "inventories");

        const inventoryRef = doc(inventoryCollection, passedInventory); //inventory should be dynamically selected

        //READ
        const inventorySnap = await getDoc(inventoryRef);

        if (!inventorySnap.exists()) {
          alert("Inventory does not exist");
          return;
        } else {
          const localItems = isNeeded
            ? inventorySnap.data().neededItems
            : inventorySnap.data().items;

          if (isNeeded) {
            // const newItems = localItems.map((item) => {
            //   if (item.name === passedItem) {
            //     if (item.quantityNeeded + amount < 0) {
            //       alert("Quantity cannot be negative");
            //       return item;
            //     }
            //     return {
            //       ...item,
            //       quantityNeeded: item.quantityNeeded + amount,
            //     };
            //   } else {
            //     return item;
            //   }
            // });

            // await updateDoc(inventoryRef, {
            //   neededItems: newItems,
            // });
            // setNeededItemList(newItems);
          } else {
            const newItems = localItems.map((item) => {
              if (item.name === passedItem) {
                // if (quantity < 0) {
                //   alert("Quantity cannot be negative");
                //   return item;
                // }
                return { 
                  ...item,
                  name: passedItem, 
                  quantity: parseInt(quantity), 
                  inventory: passedInventory, 
                  unit: unit, 
                  price: parseFloat(price),  
                  lastUpdated: new Date(),
                  isPerishable: isPerishable,
                  notes: notes.trim(),
                };
              } else {
                return item;
              }
            });
            await updateDoc(inventoryRef, {
              items: newItems,
            });
            setItemList(newItems);
          }
          //WRITE

          // fetchInventories();
        }
      } catch (error) {
        console.error("Error editing item: ", error);
      }
      fetchInventories();
    },
    [groupID]
  );
  /****************************************************** Needed Items Functions ******************************************************/

  //function to add a needed item to the inventory (1 READ, 1 WRITE operation)
  const addNeededItem = useCallback(async () => {
    console.log("adding needed item");

    if (!itemName.trim()) {
      alert("Item Name is required");
      return;
    }

    if (!selectedInventory.trim()) {
      alert("Inventory must be selected");
      return;
    }

    if (!quantityNeeded || quantityNeeded <= 0) {
      alert("Quantity must be a positive number");
      return;
    }

    const groupRef = doc(collection(db, "groups"), groupID);
    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, selectedInventory); //inventory should be dynamically selected
    //READ
    const inventorySnap = await getDoc(inventoryRef);

    const itemExists = inventorySnap
      .data()
      .neededItems.find((item) => item.name === itemName);

    if (itemExists) {
      alert("Item already exists");
      return;
    }

    if (!inventorySnap.exists()) {
      alert("Inventory does not exist");
      return;
    } else {
      const localItems = inventorySnap.data().neededItems;

      const newNeededItem = {
        name: itemName, // require user to give name
        quantityNeeded: quantityNeeded, // allow user to adjust quantity (default to 1)
        unit: unit, // allow user to adjust unit (default to null)
        inventory: selectedInventory, // automatically selected based on the inventory selected
        priority: priority, // allow user to adjust priority (default to Low)
        assignTo: assignedRoommate, // require user to assign to a roommate
        linksOnline: [], // allow user to add links (default to empty array)
        status: "Needed", // automatically set to Needed
        dateAdded: new Date(), // default to time now
        notes: notes.trim(), // allow user to add notes (default to empty string)
      };

      const newItems = [...localItems, newNeededItem];
      //WRITE
      await updateDoc(inventoryRef, {
        neededItems: newItems,
      });

      fetchInventories();
    }
    setItemName("");
    setQuantityNeeded(1);
    setUnit("");
    setSelectedInventory("");
    setPriority("Medium");
    setAssignedRoommate("");
    setLinksOnline([]);
    setStatus("Needed");
    setNotes("");
    handleCloseNeededItemModal();
  }, [
    selectedInventory,
    itemName,
    quantity,
    unit,
    priority,
    assignedRoommate,
    notes,
    groupID,
  ]);

  /****************************************************** Use Effects ******************************************************/

  //fetching inventory data (1 READ operation)
  const fetchInventories = useCallback(async () => {
    console.log("fetching inventories from DB");
    try {
      if (!user) return;
      if (!groupID) return;

      const inventoriesCol = collection(db, "groups", groupID, "inventories");

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
      console.error("Error fetching inventories from DB:", error);
    }
  }, [user, groupName, groupID]);

  useEffect(() => {
    console.log("fetching inventories from UseEffect");
    fetchInventories();
  }, [user, groupName, groupID]);

  // Fetching group data (1 READ operation)
  const fetchGroups = useCallback(async () => {
    console.log("fetching group & user from DB");
    try {
      if (!user) return;
      if (!groupID) return;

      const groupRef = doc(db, "groups", groupID);
      //READ
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const member = groupData.members.find(
          (member) => member.name === userName
        );
        const leaderState = member ? member.leader : false;
        setIsLeader(leaderState);

        const newMembers = groupData.members;

        const updatedMembers = newMembers.map((member) => ({
          ...member, // Spread the existing member properties
          expanded: false, // Add or update the 'expanded' field
        }));

        setGroupMembers(updatedMembers);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching groups from DB:", error);
    }
  }, [user, groupName, groupID]);

  // Fetching group data (1 READ operation)
  useEffect(() => {
    console.log("fetching groups from UseEffect");
    fetchGroups();
  }, [user, groupName, groupID]);

  // Filtering inventories based on search term
  useEffect(() => {
    console.log("Filtering groups");
    setFilteredInventories(
      inventories.filter((inventory) =>
        inventory.name.toLowerCase().includes(inventorySearch.toLowerCase())
      )
    );
  }, [inventorySearch, inventories]);

  // Filtering items in an inventory based on search term
  useEffect(() => {
    console.log("filtering items");
    setFilteredItems(
      itemList.filter((item) =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase())
      )
    );
  }, [itemSearch, itemList]);

  useEffect(() => {
    console.log("filtering items");
    setFilteredNeededItems(
      neededItemList.filter((item) =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase())
      )
    );
  }, [itemSearch, neededItemList]);

  useEffect(() => {
    if (user) {
      // Generate groupID only if `groupName` is available
      const groupIDValue = `${user.id.slice(-5)} ${groupName}`;
      setGroupID(groupIDValue);
      console.log("groupID from useEffect:", groupIDValue); // Log for debugging
    } else {
      console.warn("groupName or user is undefined");
    }
  }, [user, groupName]); // Re-run the effect when `user` or `groupName` changes

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
            bgcolor="white"
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
            bgcolor="white"
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
              sx={{ bgcolor: "white", width: "80%", border: "1px solid black" }}
              required
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
                inputMode="numeric"
                value={quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  // Regular expression to allow only numbers and decimals
                  if (/^\d*$/.test(value)) {
                    setQuantity(value); // Convert the value to an integer
                  }
                }}
                sx={{
                  bgcolor: "white",
                  width: "50%",
                  color: "black",
                  border: "1px solid black",
                }}
              />
              <Typography textAlign="center">X</Typography>
              <TextField
                size="small"
                placeholder="Unit (optional)"
                border="1px solid black"
                inputMode="numeric"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                sx={{
                  bgcolor: "white",
                  width: "50%",
                  border: "1px solid black",
                }}
              />
            </Stack>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              width="80%"
            >
              <Typography color="black" mr={1} width="20%">
                Price:
              </Typography>
              <TextField
                size="small"
                border="1px solid black"
                inputMode="decimal"
                value={price}
                onChange={(e) => {
                  const value = e.target.value;
                  // Regular expression to allow only numbers and decimals
                  if (/^\d*\.?\d*$/.test(value)) {
                    setPrice(value);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment sx={{ mr: 1 }}>$</InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: "white",
                  width: "80%",
                  border: "1px solid black",
                }}
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" width="80%">
              <FormControl
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FormLabel sx={{ color: "black", textAlign: "center" }}>
                  Perishable?
                </FormLabel>
                <RadioGroup
                  defaultValue="No"
                  row
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
              {/*
              <TextField
                size="small"
                placeholder="Exp. Date"
                border="1px solid black"
                inputMode="numeric"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                sx={{ bgcolor: "white", width: "60%" }}
              />
              */}
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="center"
              width="80%"
            >
              <Typography color="black" width="40%">
                Select Inventory:
              </Typography>
              <Box bgcolor="white" color="black" width="60%">
                <FormControl fullWidth>
                  <Select
                    size="small"
                    value={selectedInventory}
                    sx={{ color: "black", border: "1px solid black" }}
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
              placeholder="Add notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ bgcolor: "white", width: "80%", border: "1px solid black" }}
            />

            <Box
              onClick={() => {
                addItem();
                //handleCloseItemModal();
              }}
            >
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
            bgcolor="white"
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
              sx={{ bgcolor: "white", width: "80%", border: "1px solid black" }}
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
                onChange={(e) => {
                  const value = e.target.value;
                  // Regular expression to allow only numbers and decimals
                  if (/^\d*$/.test(value)) {
                    setQuantity(value); // Convert the value to an integer
                  }
                }}
                sx={{
                  bgcolor: "white",
                  width: "50%",
                  border: "1px solid black",
                }}
              />
              <Typography color="black" textAlign="center">
                X
              </Typography>
              <TextField
                size="small"
                placeholder="Unit (optional)"
                border="1px solid black"
                inputMode="numeric"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                sx={{
                  bgcolor: "white",
                  width: "50%",
                  border: "1px solid black",
                }}
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" width="80%">
              <Stack direction="row" alignItems="center">
                <Typography color="black" textAlign="center" mr={3}>
                  Priority:
                </Typography>
                <Box bgcolor="white" width="60%">
                  <FormControl fullWidth>
                    <Select
                      size="small"
                      value={priority}
                      sx={{ border: "1px solid black" }}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <MenuItem value={"high"}>High</MenuItem>
                      <MenuItem value={"Medium"}>Medium</MenuItem>
                      <MenuItem value={"low"}>Low</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" width="80%">
              <Typography width="30%">Select Inventory:</Typography>
              <Box bgcolor="white" color="black" width="70%">
                <FormControl fullWidth>
                  <Select
                    size="small"
                    value={selectedInventory}
                    sx={{ border: "1px solid black" }}
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
            <Stack direction="row" alignItems="center" width="80%">
              <Typography width="30%">Assign To:</Typography>
              <Box bgcolor="white" color="black" width="70%">
                <FormControl fullWidth>
                  <Select
                    size="small"
                    value={assignedRoommate}
                    sx={{ color: "black", border: "1px solid black" }}
                    onChange={(e) => setAssignedRoommate(e.target.value)}
                  >
                    {groupMembers.map((member) => (
                      <MenuItem key={member.name} value={member.name}>
                        {member.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
            <Box bgcolor="white" width="80%">
              <TextField
                multiline
                fullWidth
                placeholder="Add notes (optional)"
                value={notes}
                sx={{ border: "1px solid black" }}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
            <Box
              onClick={() => {
                addNeededItem();
              }}
              display="flex"
              justifyContent="center"
              width="30%"
            >
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
                <PaidIcon
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    fontSize: 40,
                    color: `${green_light}`,
                    transition: "200ms",
                    "&:hover": {
                      cursor: "pointer",
                      transform: "rotate(180deg) scale(1.05)",
                    },
                  }}
                  onClick={(e) => {
                    handleOpenExpenseModal();
                  }}
                />
                <Typography
                  variant="h4"
                  textAlign="center"
                  color={green_light}
                  mb={2}
                >
                  Roommates
                </Typography>
                <Stack spacing={2}>
                  {groupMembers.map((member) => (
                    <Stack
                      key={member.name}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Tooltip title="Press to show debt">
                        <Typography
                          textAlign="center"
                          color={member.expanded ? "yellow" : "white"} // Change text color on click
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              color: "lightblue", // Change text color on hover
                              transform: "scale(1.05)", // Slight zoom effect on hover
                              transition: "color 0.3s, transform 0.3s", // Smooth transition
                            },
                            transition: "color 0.3s", // Smooth transition for color change on click
                          }}
                          onClick={() => {
                            const newMembers = groupMembers.map((m) => {
                              if (m.name === member.name) {
                                m.expanded = !m.expanded;
                              }
                              return m;
                            });
                            setGroupMembers(newMembers);
                          }}
                        >
                          {member.name}
                        </Typography>
                      </Tooltip>
                      {member.expanded && (
                        <Typography textAlign="center" color="white">
                          {member.owe >= 0
                            ? `owes $${member.owe}`
                            : `needs $${member.owe * -1}`}
                        </Typography>
                      )}
                    </Stack>
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
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
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
                  <Box
                    onClick={(e) => {
                      handleOpenNewInventoryModal();
                    }}
                  >
                    <DarkButton>Create Inventory</DarkButton>
                  </Box>
                  <Box
                    onClick={(e) => {
                      handleOpenItemModal();
                    }}
                  >
                    <DarkButton>Add Item</DarkButton>
                  </Box>
                  <Box
                    onClick={(e) => {
                      handleOpenNeededItemModal();
                    }}
                  >
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
          bgcolor="white"
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
              handleCloseMemberModal();
            }}
          />
          <Tooltip title="Leave Group">
            <DarkButton
              mr={-50}
              onClick={() => {
                handleOpenLeaveGroupModal();
              }}
            >
              <DirectionsRunIcon />
            </DarkButton>
          </Tooltip>
          <Typography variant="h5" textAlign="center">
            Edit Group
          </Typography>
          <Stack direction="column" spacing={1}>
            {groupMembers.map((member) => (
              <Stack
                key={member.name}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Chip label={member.name} variant="filled" />
                {isLeader && member.name !== userName ? (
                  <TooltipIcon title="Remove" placement="top">
                    <Box
                      onClick={() => {
                        handleCloseMemberModal();
                        setKickedMember(member.name);
                        handleOpenKickMemberModal();
                      }}
                    >
                      <DeleteOutlineIcon />
                    </Box>
                  </TooltipIcon>
                ) : null}
                {member.leader ? <StarsSharpIcon /> : null}
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
      <Box width="80%" maxWidth="lg" flexGrow={1}>
        <Grid container spacing={2} mb={8}>
          {filteredInventories.map((inventory) => (
            <Grid item key={inventory.name} xs={12} sm={6} md={4}>
              <Box
                position="relative"
                height="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                borderRadius={"15px"}
                minHeight="200px"
                bgcolor={green_light}
                color="black"
                boxShadow="0 0 5px black"
                border={`2px solid ${green_dark}`}
                onClick={(event) => {
                  setItemList(inventory.items);
                  setInventoryNameForDisplay(inventory.name);
                  handleOpenInventoryModal(inventory.name);
                }}
                sx={{
                  transition: "500ms",
                  "&:hover": {
                    transform: "scale(1.02)",
                    bgcolor: `${green_dark}`,
                    color: "white",
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
                  onClick={(event) => {
                    handleOpenDeleteInventoryModal(inventory.name);
                    event.stopPropagation();
                  }}
                />
                <TooltipIcon title="Shopping List" placement="top">
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 5,
                      fontSize: 40,
                      color: `${green_dark}`,
                      transition: "200ms",
                      "&:hover": {
                        cursor: "pointer",
                        color: `${green_light}`,
                        transform: "scale(1.05)",
                      },
                    }}
                    onClick={(event) => {
                      setInventoryNameForShopping(inventory.name);
                      setSelectedInventory(inventory.name);
                      setNeededItemList(inventory.neededItems);
                      handleOpenShoppingListModal();
                      event.stopPropagation();
                    }}
                  >
                    <DarkButton>
                      <ShoppingCartOutlinedIcon />
                    </DarkButton>
                  </Box>
                </TooltipIcon>
                <Typography
                  variant="h6"
                  maxHeight="100%"
                  width="90%"
                  overflow="auto"
                  textAlign="center"
                  sx={{
                    overflowWrap: "break-word",
                    "&:hover": { cursor: "pointer" },
                  }}
                >
                  {inventory.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Modal that displays inventory items */}
      <Modal open={openInventoryModal}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width="90%"
          maxWidth="lg"
          minHeight="50%"
          maxHeight="80%"
          bgcolor="white"
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
              handleCloseInventoryModal();
            }}
          />
          <Typography variant="h4" textAlign="center" width="80%">
            {inventoryNameForDisplay}
          </Typography>
          <Box
            border="1px solid black"
            borderRadius="20px"
            p={2}
            sx={{
              background: `linear-gradient(to left, #fff, ${green_light})`,
              width: { xs: "80%", sm: "60%" },
            }}
          >
            <TextField
              size="small"
              fullWidth
              label="Search Items"
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Item Display */}
          <Box width="80%" maxWidth="lg" overflow="auto">
            <Grid
              container
              flexGrow={1}
              spacing={2}
              diplay="flex"
              justifyContent="center"
            >
              {filteredItems.length ? (
                filteredItems.map((item) => (
                  <Grid item key={item.name} xs={12} md={12} lg={12}>
                    <Stack
                      direction="column"
                      // justifyContent="space-between"
                      alignItems="center"
                      borderRadius="15px"
                      border="2px solid black"
                      spacing={2}
                      py={1}
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
                      <Stack
                        sx={{
                          flexDirection: { xs: "column", md: "row" },
                        }}
                        spacing={2}
                        width="100%"
                        px={2}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Stack
                          display="flex"
                          direction="column"
                          justifyContent="center"
                          alignItems="center"
                          zIndex={2}
                          sx={{ width: { xs: "50%", md: "20%" } }}
                        >
                          {groupMembers.map((member) => (
                            <Chip
                              key={member.name}
                              label={member.name}
                              variant="outlined"
                              sx={{ border: "1px solid black" }}
                            />
                          ))}
                        </Stack>
                        <Box
                          zIndex={2}
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="center"
                          sx={{ width: { xs: "50%", md: "15%" } }}
                        >
                          <Typography textAlign="center" fontWeight="bold">
                            {item.name}
                          </Typography>
                        </Box>
                        <Box
                          zIndex={2}
                          sx={{ width: { xs: "50%", md: "12%" } }}
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Typography>
                            Qty. {item.quantity} {item.unit}
                          </Typography>
                        </Box>
                        <Typography
                          zIndex={2}
                          sx={{ width: { xs: "50%", md: "10%" } }}
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          ${item.price}
                        </Typography>
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          zIndex={2}
                          sx={{ width: { xs: "50%", md: "20%" } }}
                        >
                          <Typography textAlign="center">
                            {item.isPerishable
                              ? "Perishable"
                              : "Not Perishable"}
                          </Typography>
                          <Typography
                            sx={{
                              display: { xs: "block", sm: "inline" },
                              pl: { xs: 0, sm: 2, md: 3, lg: 3, xl: 4 },
                            }}
                          >
                            {item.expiryDate}
                          </Typography>
                        </Box>
                        <Box
                          zIndex={2}
                          display="flex"
                          width="15%"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <TooltipIcon title="Delete" placement="top">
                            <DeleteOutlineIcon
                              sx={{ "&:hover": { cursor: "pointer", transform: "scale(1.2)"} }}
                              onClick={() => {
                                deleteItem(item.inventory, item.name, false);
                              }}
                            />
                          </TooltipIcon>
                          <TooltipIcon title="-1" placement="top">
                            <RemoveIcon
                              sx={{
                                mx: { xs: 1 },
                                "&:hover": { cursor: "pointer" },
                              }}
                              onClick={() => {
                                editQuantity(
                                  item.inventory,
                                  item.name,
                                  -1,
                                  false
                                );
                              }}
                            />
                          </TooltipIcon>
                          <TooltipIcon title="+1" placement="top">
                            <AddIcon
                              sx={{ mr: 1, "&:hover": { cursor: "pointer" } }}
                              onClick={() => {
                                editQuantity(
                                  item.inventory,
                                  item.name,
                                  1,
                                  false
                                );
                              }}
                            />
                          </TooltipIcon>
                          <TooltipIcon title="Edit Item" placement="top">
                            <EditIcon
                              sx={{ '&:hover': { cursor: "pointer", transform: "scale(1.2)"}}}
                              onClick={() => {
                                setItemName(item.name);
                                setQuantity(item.quantity);
                                setUnit(item.unit);
                                setPrice(item.price);
                                setIsPerishable(item.isPerishable);
                                setNotes(item.notes);
                                setSelectedInventory(inventoryNameForDisplay);
                                handleOpenEditItemModal();
                              }}
                            />
                          </TooltipIcon>
                        </Box>
                      </Stack>
                      <Typography zIndex={2} textAlign="center" width="50%">
                        {item.notes ? `"${item.notes}"` : ""}
                      </Typography>
                    </Stack>
                  </Grid>
                ))
              ) : (
                <Typography textAlign="center" mt={3}>
                  No Items Here
                </Typography>
              )}
            </Grid>
          </Box>
        </Box>
      </Modal>

      {/*Modal for editing items */}
      <Modal open={openEditItemModal}>
          <Stack
            position="absolute"
            top="50%"
            left="50%"
            width="80%"
            maxWidth="sm"
            bgcolor="white"
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
                handleCloseEditItemModal();
              }}
            />
            <Typography variant="h5" textAlign="center">
              Edit Item
            </Typography>
            <TextField
              size="small"
              placeholder="Name"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{ bgcolor: "white", width: "80%", border: "1px solid black" }}
              required
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
                inputMode="numeric"
                value={quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  // Regular expression to allow only numbers and decimals
                  if (/^\d*$/.test(value)) {
                    setQuantity(value); // Convert the value to an integer
                  }
                }}
                sx={{
                  bgcolor: "white",
                  width: "50%",
                  color: "black",
                  border: "1px solid black",
                }}
              />
              <Typography textAlign="center">X</Typography>
              <TextField
                size="small"
                placeholder="Unit (optional)"
                border="1px solid black"
                inputMode="numeric"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                sx={{
                  bgcolor: "white",
                  width: "50%",
                  border: "1px solid black",
                }}
              />
            </Stack>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              width="80%"
            >
              <Typography color="black" mr={1} width="20%">
                Price:
              </Typography>
              <TextField
                size="small"
                border="1px solid black"
                inputMode="decimal"
                value={price}
                onChange={(e) => {
                  const value = e.target.value;
                  // Regular expression to allow only numbers and decimals
                  if (/^\d*\.?\d*$/.test(value)) {
                    setPrice(value);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment sx={{ mr: 1 }}>$</InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: "white",
                  width: "80%",
                  border: "1px solid black",
                }}
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" width="80%">
              <FormControl
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FormLabel sx={{ color: "black", textAlign: "center" }}>
                  Perishable?
                </FormLabel>
                <RadioGroup
                  defaultValue={isPerishable ? "Yes" : "No"}
                  row
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
              {/*
              <TextField
                size="small"
                placeholder="Exp. Date"
                border="1px solid black"
                inputMode="numeric"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                sx={{ bgcolor: "white", width: "60%" }}
              />
              */}
            </Stack>
            <TextField
              multiline
              placeholder="Add notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ bgcolor: "white", width: "80%", border: "1px solid black" }}
            />

            <Box
              onClick={() => {
                editItem(selectedInventory, itemName, false);
                handleCloseEditItemModal();
              }}
            >
              <DarkButton>Save Changes</DarkButton>
            </Box>
          </Stack>
        </Modal>

      {/* Modal for Inventory Deletion */}
      <Modal open={openDeleteInventoryModal}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          bgcolor="white"
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
            width: { xs: "80%", sm: "60%" },
            maxWidth: "md",
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
              setOpenDeleteInventoryModal(false);
            }}
          />
          <Typography variant="h4" width="80%" textAlign="center">
            Inventory Deletion
          </Typography>
          <Typography width="80%" textAlign="center">
            Are you sure you want to delete {inventoryNameForDeletion} and all
            its contents?
          </Typography>
          <Box
            onClick={() =>
              handleCloseDeleteInventoryModal(inventoryNameForDeletion)
            }
          >
            <DarkButton>Delete</DarkButton>
          </Box>
        </Box>
      </Modal>

      {/* Modal for Leaving Group */}
      <Modal open={openLeaveGroupModal}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          bgcolor="white"
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
            width: { xs: "80%", sm: "60%" },
            maxWidth: "small",
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
              handleCloseDeleteInventoryModal();
            }}
          />
          <Typography variant="h4" width="80%" textAlign="center">
            Goodbye!!
          </Typography>
          <Typography width="80%" textAlign="center">
            Are you sure you want to leave your lovely {groupName} and all your
            friends?
          </Typography>
          <Box
            onClick={() => {
              leaveGroup();
              handleCloseLeaveGroupModal();
            }}
          >
            <DarkButton>Leave</DarkButton>
          </Box>
        </Box>
      </Modal>

      {/* Modal for Handling Expenses */}
      <Modal open={openExpenseModal}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          bgcolor="white"
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
            width: { xs: "80%", sm: "60%" },
            maxWidth: "md",
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
              handleCloseExpenseModal();
            }}
          />
          <Typography variant="h4" width="80%" textAlign="center">
            {groupName} Expenses
          </Typography>
          <Typography width="80%" textAlign="center">
            You know how much everyone owes (hint: press on a roommate's name).
          </Typography>
          <Typography width="80%" textAlign="center">
            Handle payments among yourselves -_-
          </Typography>
          <Typography width="80%" textAlign="center">
            Do you want to clear expenses for everyone?
          </Typography>
          <Box
            onClick={() => {
              clearExpenses();
              handleCloseExpenseModal();
            }}
          >
            <DarkButton>Yes, we took care of it.</DarkButton>
          </Box>
        </Box>
      </Modal>
      {/* Modal for Inventory Deletion */}
      <Modal open={openDeleteInventoryModal}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          bgcolor="white"
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
            width: { xs: "80%", sm: "60%" },
            maxWidth: "md",
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
              setOpenDeleteInventoryModal(false);
            }}
          />
          <Typography variant="h4" width="80%" textAlign="center">
            Inventory Deletion
          </Typography>
          <Typography width="80%" textAlign="center">
            Are you sure you want to delete {inventoryNameForDeletion} and all
            its contents?
          </Typography>
          <Box
            onClick={() =>
              handleCloseDeleteInventoryModal(inventoryNameForDeletion)
            }
          >
            <DarkButton>Delete</DarkButton>
          </Box>
        </Box>
      </Modal>

      {/* Modal for showing shopping list*/}
      <Modal open={openShoppingListModal}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width="90%"
          maxWidth="lg"
          minHeight="50%"
          maxHeight="80%"
          bgcolor="white"
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
              handleCloseShoppingListModal();
            }}
          />
          <Typography variant="h4" width="80%" textAlign="center">
            {inventoryNameForShopping} Shopping List
          </Typography>
          <Box
            border="1px solid black"
            borderRadius="20px"
            p={2}
            sx={{
              background: `linear-gradient(to left, #fff, ${green_light})`,
              width: { xs: "80%", sm: "60%" },
            }}
          >
            <TextField
              size="small"
              fullWidth
              label="Search Items"
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TooltipIcon title="AI Suggestions" placement="top">
            <Box
              sx={{
                fontSize: 40,
                color: `${green_dark}`,
                transition: "200ms",
                "&:hover": {
                  cursor: "pointer",
                  color: `${green_light}`,
                  transform: "scale(1.05)",
                },
              }}
              onClick={() => {
                getSuggestions(inventoryNameForShopping);
              }}
            >
              <DarkButton>
                <Typography mr={1}>AI Suggest</Typography>
                <AutoAwesomeIcon />
              </DarkButton>
            </Box>
          </TooltipIcon>
          
          {/* Shopping list (left) and suggested (right) lists */}
          <Stack
            width="100%"
            height="80%"
            maxHeight="80%"
            overflow="auto"
            spacing={1}
            gap={1}
            sx={{  flexDirection: { xs: "column", md: "row-reverse" } }}
          >
            {/* Stack that displays the suggested items */}
            {!isEmptyObj(suggestedItems) ? (
              <Box height="90%" maxHeight="90%" border="1px solid black" borderRadius="15px" textAlign="center" px={1} pt={1} overflow="auto">
                {suggestedItems.items.map((item) => (
                  <Stack
                    key={item.name} 
                    direction="column"
                    alignItems="center"
                    width="100%"
                    borderRadius="15px"
                    border="2px solid black"
                    py={1}
                    position="relative"
                    mb={1}
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
                    <Stack direction="row" justifyContent="center" alignItems="center" textAlign="center" zIndex={2}>
                      <Typography
                        textAlign="center"
                        fontWeight="bold"
                        px={1}
                      >
                        {item.name}
                      </Typography>
                      <Stack direction="row">
                        <Box onClick={() => deleteItem()}>
                          <TooltipIcon title="Discard" placement="top">
                            <DeleteOutlineIcon sx={{fontSize: 25}} onClick={() => {rejectSuggestion(item.name)}} />
                          </TooltipIcon>
                        </Box>
                        <Box mr={1}>
                          <TooltipIcon title="Confirm" placement="top">
                            <CheckIcon sx={{fontSize: 25}} onClick={() => {acceptSuggestion(inventoryNameForShopping, item.name)}} />
                          </TooltipIcon>
                        </Box>
                      </Stack>
                    </Stack>
                  </Stack>
                ))}
              </Box>
            ) : (
              <Box display="hidden"></Box>
            )}
            {/* Needed items */}
            
            <Box width="100%" height="100%" maxWidth="lg" overflow="auto">
              {filteredNeededItems.map((item) => (
                <Stack
                  key={item.name}
                  direction="column"
                  alignItems="center"
                  borderRadius="15px"
                  border="2px solid black"
                  overflow="auto"
                  spacing={2}
                  pb={2}
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
                  <Stack
                    sx={{
                      flexDirection: { xs: "column", md: "row" },
                    }}
                    width="100%"
                    spacing={1}
                    px={2}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Box
                      zIndex={2}
                      sx={{ width: { xs: "50%", md: "35%" } }}
                    >
                      {item.assignTo ? (
                        <Typography textAlign="center">
                          Assigned To: <strong>{item.assignTo}</strong>
                        </Typography>
                      ) : (
                        <Typography textAlign="center">Not Assigned</Typography>
                      )}
                    </Box>
                    <Box
                      zIndex={2}
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                      sx={{ width: { xs: "50%", md: "15%" } }}
                    >
                      <Typography textAlign="center" fontWeight="bold">
                        {item.name}
                      </Typography>
                    </Box>
                    <Box
                      zIndex={2}
                      sx={{ width: { xs: "50%", md: "12%" } }}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Typography>
                        Qty. {item.quantityNeeded} {item.unit}
                      </Typography>
                    </Box>
                    <Box
                      zIndex={2}
                      sx={{ width: { xs: "50%", md: "20%" } }}
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Typography mr={1}>Priority:</Typography>
                      <Typography
                        color={
                          item.priority === "low"
                            ? green_dark
                            : item.priority === "med"
                            ? "#B5A642"
                            : "#A52A2A"
                        }
                      >
                        {item.priority === "low"
                          ? "Low"
                          : item.priority === "med"
                          ? "Medium"
                          : "High"}
                      </Typography>
                    </Box>
                    <Box
                      zIndex={2}
                      display="flex"
                      width="15%"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <TooltipIcon title="Delete" placement="top">
                        <DeleteOutlineIcon
                          sx={{
                            ml: 2,
                            "&:hover": { cursor: "pointer" },
                          }}
                          onClick={() => {
                            deleteItem(item.inventory, item.name, true);
                          }}
                        />
                      </TooltipIcon>
                      <TooltipIcon title="-1" placement="top">
                        <RemoveIcon
                          sx={{ mx: { xs: 1 }, "&:hover": { cursor: "pointer" } }}
                          onClick={() => {
                            editQuantity(item.inventory, item.name, -1, true);
                          }}
                        />
                      </TooltipIcon>
                      <TooltipIcon title="+1" placement="top">
                        <AddIcon
                          sx={{ mr: 1, "&:hover": { cursor: "pointer" } }}
                          onClick={() => {
                            editQuantity(item.inventory, item.name, 1, true);
                          }}
                        />
                      </TooltipIcon>
                    </Box>
                    <Box
                      zIndex={2}
                      onClick={() => buyItem(inventoryNameForShopping, item.name)}
                    >
                      <DarkButtonSimple mr={1} ml={1}>I bought</DarkButtonSimple>
                    </Box>
                  </Stack>
                  {item.notes ? (
                    <Typography zIndex={2} textAlign="center" width="50%">
                      Notes: {`"${item.notes}"`}
                    </Typography>
                  ) : (<></>)}
                </Stack>
              ))}
            </Box>
          </Stack>
        </Box>
      </Modal>
    </Stack>
  );
}
