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
import TooltipIcon from "../../Components/tooltipicon";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { DarkButton, LightButtonSimple } from "../../Components/styledbuttons";
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
  const [groupNameForDeletion, setGroupNameForDeletion] = useState("");
  const [groupNameToEdit, setGroupNameToEdit] = useState("");

  // Real data from Firebase
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);

  const [addInventoryModal, setAddInventoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [openDeleteGroupModal, setOpenDeleteGroupModal] = useState(false);
  const handleOpenDeleteGroupModal = () => setOpenDeleteGroupModal(true);
  const handleCloseDeleteGroupModal = () => setOpenDeleteGroupModal(false);

  const [openEditGroupModal, setOpenEditGroupModal] = useState(false);
  const handleOpenEditGroupModal = () => setOpenEditGroupModal(true);
  const handleCloseEditGroupModal = () => setOpenEditGroupModal(false);

  /****************************************************** Routing ******************************************************/

  const handleGroupClick = (name) => {
    router.push(`/group?id=${name}`);
  };

  /****************************************************** Handling Groups ******************************************************/

  //function to add a group (that includes the user that created it) to the database (1 READ, 1 WRITE)
  const createGroup = useCallback(async () => {
    console.log("Creating group");
    if (!groupName) {
      alert("Please enter a group name");
      return;
    }

    const userName = `${user.firstName} ${user.lastName}`;

    const newGroup = {
      name: groupName,
      members: [{ name: `${userName}`, leader: true, owe: 0, id: user.id }],
    };

    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, "users"), user.id);

    //const groupID = user.id.slice(-5) + " " + groupName;

    const customID = Math.random().toString(36).substring(2, 8);

    const groupID = customID + " " + groupName;

    const groupDocRef = doc(collection(db, "groups"), groupID);

    const userSnap = await getDoc(userDocRef);

    const newUserGroup = { name: groupName, id: groupID };

    try {
      // Check if user exists
      //READ

      if (!userSnap.exists()) {
        // Create user if it does not exist

        const newUser = {
          ID: user.id,
          name: userName,
          groups: [newUserGroup],
        };
        batch.set(userDocRef, newUser);
      } else {
        const groupExists = userSnap
          .data()
          .groups.find((group) => group.name === groupName);
        if (groupExists) {
          alert("User already exists in this group");
          return;
        } else {
          const userData = userSnap.data();

          batch.update(userDocRef, {
            groups: [...userData.groups, newUserGroup], // Alternatively use arrayUnion if you want to handle duplicates automatically
          });
        }
      }

      batch.set(groupDocRef, newGroup);
      setGroups([...groups, newGroup]);

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
  const deleteGroup = useCallback(
    async (passedGroup) => {
      console.log("Deleting group");

      //const groupID = user.id.slice(-5) + " " + passedGroup;

      const userDocRef = doc(collection(db, "users"), user.id);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.data();
      const groupID = userData.groups.find(
        (group) => group.name === passedGroup
      ).id;

      const batch = writeBatch(db);

      const groupRef = doc(collection(db, "groups"), groupID);

      // Get inventories collection
      const inventoriesCollection = collection(
        db,
        "groups",
        groupID,
        "inventories"
      );
      //READ
      const [groupSnap, inventoriesSnap] = await Promise.all([
        getDoc(groupRef),
        getDocs(inventoriesCollection),
      ]);

      const groupData = groupSnap.data();

      const isLeader = groupData.members.find(
        (member) => member.name === `${user.firstName} ${user.lastName}`
      )?.leader;

      if (!isLeader) {
        alert("You must be the leader of the group to delete.");
        return;
      }

      if (groupSnap.exists() && inventoriesSnap.size > 0) {
        // Process inventories
        inventoriesSnap.forEach((inventory) => {
          const inventoryName = inventory.id; // Use the document ID for the name
          const inventoryRef = doc(inventoriesCollection, inventoryName);
          // Add deletion to the batch
          batch.delete(inventoryRef);
        });
      }

      console.log("Groups before deletion:", groups);
      const remainingGroups = groups.filter(
        (group) => group.name !== passedGroup
      );
      console.log("Remaining groups:", remainingGroups);
      setGroups(remainingGroups);

      // Finally, delete the group after all inventory deletions are added to the batch
      batch.delete(groupRef);

      try {
        //READ
        const userDocRef = doc(collection(db, "users"), user.id);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("userData", userData.groups);
          console.log("groupName", passedGroup);
          const newGroups = userData.groups.filter(
            (group) => group.name !== passedGroup
          );

          console.log("newGroups", newGroups);

          batch.update(userDocRef, {
            groups: newGroups,
          });
        }
      } catch (error) {
        console.error("Error adjusting user's groups:", error);
        alert("An error occurred while deleting the group. Please try again.");
      }

      // Commit the batch operation
      await batch.commit();
    },
    [groups, user]
  );

  //Function to edit group name
  const editGroup = useCallback(
    async (newName) => {
      if (newName === groupNameToEdit) {
        return;
      }

      const userDocRef = doc(collection(db, "users"), user.id);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.data();
      const prevGroupID = userData.groups.find(
        (group) => group.name === groupNameToEdit
      ).id;

      const customID = prevGroupID.split(" ")[0];

      //const prevGroupID = user.id.slice(-5) + " " + groupNameToEdit;
      const newGroupID = customID + " " + newName;
      const batch = writeBatch(db);

      try {
        // References to the old and new group documents
        const prevGroupRef = doc(collection(db, "groups"), prevGroupID);
        const oldGroupSnap = await getDoc(prevGroupRef);
        const groupData = oldGroupSnap.data();

        const isLeader = groupData.members.find(
          (member) => member.name === `${user.firstName} ${user.lastName}`
        )?.leader;

        if (!isLeader) {
          alert("You must be the leader of the group to edit.");
          return;
        }
        const newGroupRef = doc(collection(db, "groups"), newGroupID);

        // Get the old group document

        if (!oldGroupSnap.exists()) {
          console.error("Old group does not exist.");
          return;
        }

        // Rename group by creating a new document and deleting the old one
        if (oldGroupSnap.exists()) {
          // Process inventories under the old group
          const inventoriesCollection = collection(
            db,
            "groups",
            prevGroupID,
            "inventories"
          );
          const inventoriesSnap = await getDocs(inventoriesCollection);

          // Create new inventories under the new group ID
          const newInventoriesCollection = collection(
            db,
            "groups",
            newGroupID,
            "inventories"
          );

          inventoriesSnap.forEach((inventory) => {
            const inventoryRef = doc(inventoriesCollection, inventory.id);
            const newInventoryRef = doc(newInventoriesCollection, inventory.id);
            batch.set(newInventoryRef, inventory.data()); // Copy the inventory data to the new reference
            batch.delete(inventoryRef); // Delete the old inventory reference
          });

          // Delete the old group document
          batch.delete(prevGroupRef);

          // Update the new group document with the old group's data
          const groupData = oldGroupSnap.data();
          batch.set(newGroupRef, { ...groupData, name: newName });

          // Update user's group list
          const userDocRef = doc(collection(db, "users"), user.id);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const updatedGroups = userData.groups.map((group) =>
              group.name === groupNameToEdit
                ? { name: newName, id: newGroupID }
                : group
            );
            batch.update(userDocRef, { groups: updatedGroups });
          }

          // Commit the batch operation
          await batch.commit();

          // Update local state
          const updatedGroupsList = groups.map((group) =>
            group.name === groupNameToEdit ? { ...group, name: newName } : group
          );
          setGroups(updatedGroupsList);

          console.log("Group name updated successfully.");
        }
      } catch (error) {
        console.error("Error editing group name:", error);
        alert(
          "An error occurred while updating the group name. Please try again."
        );
      }
    },
    [groupNameToEdit, groups, user]
  );

  // Function to leave a group (1 READ, 2 WRITE)
  const leaveGroup = useCallback(async () => {
    console.log("Leaving group");

    //const groupID = user.id.slice(-5) + " " + groupName;
    const userDocRef = doc(collection(db, "users"), user.id);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.data();
    const groupID = userData.groups.find(
      (group) => group.name === groupNameToEdit
    ).id;

    const groupDocRef = doc(collection(db, "groups"), groupID);

    const batch = writeBatch(db);

    //adjust user's groups
    try {
      //READ
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const newGroups = userData.groups.filter(
          (group) => group.name !== groupName
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
  }, [groupName, user]);

  /****************************************************** Use Effects ******************************************************/

  // Function to fetch the user's groups from the database (2 READS)
  useEffect(() => {
    const getGroups = async () => {
      console.log("Fetching groups");
      if (!user) return;

      const userRef = doc(collection(db, "users"), user.id);
      //READ
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const groupsRef = collection(db, "groups");

        const querySnapshot = await getDocs(groupsRef);

        const groupData = querySnapshot.docs.map((doc) => doc.data());

        const groupObjects = groupData.filter((group) =>
          group.members.find(
            (member) => member.name === `${user.firstName} ${user.lastName}`
          )
        );
        /*

        //READ
        const querySnapshot = await getDocs(groupsRef);

        const matchingDocs = querySnapshot.docs.filter((doc) => {
          const docId = doc.id;
          return docId.includes(groupID);
        });

        const groupObjects = matchingDocs.map((doc) => doc.data());
        */

        setGroups(groupObjects);
        setFilteredGroups(groupObjects);
      } else {
        console.log("User does not exist");
      }
    };

    getGroups();
  }, [user]);

  useEffect(() => {
    console.log("User:", user);
    console.log("Groups:", groups);
  }, [groups]);

  // Function to filter groups based on search term
  useEffect(() => {
    console.log("Filtering groups");
    setFilteredGroups(
      groups.filter((group) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, groups]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
    >
      {/* Modal for deleting group */}
      <Modal open={openDeleteGroupModal}>
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
              setOpenDeleteGroupModal(false);
            }}
          />
          <Typography variant="h4" width="80%" textAlign="center">
            Delete Group
          </Typography>
          <Typography width="80%" textAlign="center">
            Are you sure you want to delete {groupNameForDeletion} and all its
            contents?
          </Typography>
          <Box
            onClick={() => {
              deleteGroup(groupNameForDeletion);
              handleCloseDeleteGroupModal();
            }}
          >
            <DarkButton>Delete</DarkButton>
          </Box>
        </Box>
      </Modal>
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
          {user ? (
            <Typography
              textAlign="center"
              color={green_white}
              sx={{ typography: { xs: "h5", sm: "h4" } }}
            >
              Welcome, {user.firstName}, to Your Roomventory
            </Typography>
          ) : null}
        </Box>
      </Box>
      <Stack
        width="100%"
        direction="row"
        spacing={2}
        justifyContent="center"
        mt={4}
      >
        <Box
          width="60%"
          maxWidth="md"
          border="1px solid black"
          borderRadius="20px"
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
        <Box display="flex" alignItems="center" justifyContent="center">
          <TooltipIcon title="Create Group" placement="top">
            <AddCircleOutlineIcon
              onClick={() => setAddInventoryModal(true)}
              sx={{
                color: `${green_dark}`,
                fontSize: 70,
                transition: "200ms",
                "&:hover": {
                  transform: "rotate(180deg) scale(1.05)",
                },
              }}
            />
          </TooltipIcon>
        </Box>
      </Stack>
      <Box width="80%" maxWidth="lg" my={5}>
        <Grid
          container
          flexGrow={1}
          spacing={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {filteredGroups.map((group) => (
            <Grid item key={group.name} xs={12} sm={6} md={4}>
              <Box
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
                onClick={() => handleGroupClick(group.name)}
                sx={{
                  transition: "500ms",
                  "&:hover": {
                    transform: "scale(1.02)",
                    bgcolor: `${green_dark}`,
                    color: `${green_white}`,
                    cursor: "pointer",
                  },
                }}
              >
                <TooltipIcon title="Edit Group" placement="top">
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 5,
                      fontSize: 40,
                      color: `${green_dark}`,
                      "&:hover": {
                        cursor: "pointer",
                        color: `${green_light}`,
                        transform: "scale(1.05)",
                      },
                    }}
                    onClick={(event) => {
                      setGroupName(group.name);
                      setGroupNameToEdit(group.name);
                      handleOpenEditGroupModal();
                      event.stopPropagation();
                    }}
                  >
                    <LightButtonSimple>
                      <EditIcon />
                    </LightButtonSimple>
                  </Box>
                </TooltipIcon>
                <TooltipIcon title="Delete Group" placement="top">
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 5,
                      fontSize: 40,
                      color: `${green_dark}`,
                      "&:hover": {
                        cursor: "pointer",
                        color: `${green_light}`,
                        transform: "scale(1.05)",
                      },
                    }}
                    onClick={(event) => {
                      setGroupNameForDeletion(group.name);
                      handleOpenDeleteGroupModal();
                      event.stopPropagation();
                    }}
                  >
                    <LightButtonSimple>
                      <DeleteOutlineIcon />
                    </LightButtonSimple>
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
                  {group.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Modal for adding a new group */}
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
              setAddInventoryModal(false);
            }}
          />
          <Typography
            textAlign="center"
            color={green_dark}
            mb={2}
            sx={{ typography: { xs: "h6", sm: "h5" } }}
          >
            Create New Group
          </Typography>
          <Stack sx={{ direction: { xs: "column", sm: "row" } }}>
            <TextField
              fullWidth
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              sx={{ mr: 2, mb: { xs: 2 } }}
            />
            <Box
              onClick={() => {
                createGroup();
              }}
            >
              <DarkButton fullWidth>Create</DarkButton>
            </Box>
          </Stack>
        </Box>
      </Modal>

      {/* Modal for editing an existing group */}
      <Modal open={openEditGroupModal}>
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
              handleCloseEditGroupModal();
            }}
          />
          <Typography
            textAlign="center"
            color={green_dark}
            mb={2}
            sx={{ typography: { xs: "h6", sm: "h5" } }}
          >
            Edit Group
          </Typography>
          <Stack sx={{ direction: { xs: "column", sm: "row" } }}>
            <TextField
              fullWidth
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              sx={{ mr: 2, mb: { xs: 2 } }}
            />
            <Box
              onClick={() => {
                editGroup(groupName);
                handleCloseEditGroupModal();
              }}
            >
              <DarkButton fullWidth>Save Changes</DarkButton>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
