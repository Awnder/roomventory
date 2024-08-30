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
import {
  writeBatch,
  doc,
  collection,
  getDoc,
  deleteDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { useState, useEffect } from "react";

// colors
const green_white = "#F3F6F9";
const green_light = "#D3F8CC";
const green_main = "#7EB09B";
const green_dark = "#4E826B";
const green_darkest = "#1D3417";
const gray_dark = "#1C2025";

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [addInventoryModal, setAddInventoryModal] = useState(false);
  const [inventoryName, setInventoryName] = useState("");
  const [itemName, setItemName] = useState("");
  const router = useRouter();

  //just for testing (change it to be dynamic later)
  const groupName = "home";
  //just for testing (change it to be dynamic later)
  const inventory = "Kithcen";

  const handleSubmit = async () => {
    setInventoryName("");
    setAddInventoryModal(false);
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
      await setDoc(inventoryRef, { name: inventoryName, items: [] });
    }
    setInventoryName("");
  };

  const addItem = async () => {
    const groupRef = doc(collection(db, "groups"), groupName);
    const inventoryCollection = collection(groupRef, "inventories");

    const inventoryRef = doc(inventoryCollection, inventory);

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

  /*
  const deleteItem = async () => {
    const groupRef = doc(collection(db, "groups"), groupName);
    const inventoryCollection = collection(groupRef, "inventories");
    
    const inventoryRef = doc(inventoryCollection, inventory);

    const itemsCollection = collection(inventoryRef, "items");

    const itemRef = doc(itemsCollection, itemName);
    const itemSnap = await getDoc(itemRef);

    if (itemSnap.exists()) {
        await deleteDoc(itemRef);
    }
    else{
      alert("Item does not exist");
    }
  }
    */

  /*
  const deleteInventory = async () => {
    try {
      const groupRef = doc(collection(db, "groups"), groupName);
      const inventoryCollection = collection(groupRef, "inventories");

      const inventoryRef = doc(inventoryCollection, inventory);

      const itemsCollectionRef = collection(inventoryRef, "items");

      // Fetch all documents in the subcollection
      const itemsSnap = await getDocs(itemsCollectionRef);

      // Delete each document in the subcollection
      const deletePromises = itemsSnap.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      console.log("All documents in the subcollection deleted successfully!");

      const inventorySnap = await getDoc(inventoryRef);

      if (inventorySnap.exists()) {
        await deleteDoc(inventoryRef);
      } else {
        alert("Inventory does not exist");
      }
    } catch (error) {
      console.error("Error deleting inventory:", error);
    }

  };
*/

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
    >
      <Modal
        open={addInventoryModal}
        onClose={() => setAddInventoryModal(false)}
      >
        <Box
          flex="display"
          justifyContent="center"
          alignItems="center"
          bgcolor={green_white}
          width="400px"
          height="200px"
          p={2}
        >
          <Typography variant="h4" textAlign="center" color={green_main}>
            Add Inventory
          </Typography>
          <Stack flexDirection="row">
            <TextField
              fullWidth
              label="Inventory Name"
              value={inventoryName}
              onChange={(e) => setInventoryName(e.target.value)}
            />
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Create
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box width="80%" maxWidth="lg" mt={5}>
        <Typography variant="h4" textAlign="center">
          Test Form
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
          <TextField
            label="Test Input"
            variant="outlined"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={createInventory}>
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
