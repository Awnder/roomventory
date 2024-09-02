"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SignUpPage from "../../signup/[[...sign-up]]/page";
import { SignUp, SignIn } from "@clerk/nextjs";
import { Box, Typography } from "@mui/material";
import { SignedIn, SignedOut, useSignUp } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { db } from "/firebase";
import { writeBatch, doc, collection, getDoc } from "firebase/firestore";

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ticket, setTicket] = useState(null);
  const [invitationID, setInvitationID] = useState(null);
  const router = useRouter();

  const green_main = "#7EB09B";
  const green_dark = "#4E826B";

  useEffect(() => {
    // Extract the ticket from the URL
    const param = "__clerk_ticket";
    const ticketParam = new URL(window.location.href).searchParams.get(param);
    setTicket(ticketParam);
  }, []);

  useEffect(() => {
    const urlParams = new URL(window.location.href).searchParams;
    const invitationID = urlParams.get("invitation_id");

    if (invitationID) {
      // Logic to handle if the user was redirected via an invitation
      console.log(
        "User was redirected through an invitation with ID:",
        invitationID
      );
      setInvitationID(invitationID);

      // Optionally, you can verify the invitation ID with your backend or Clerk
      // fetch(`/api/verifyInvitation/${invitationID}`).then(response => response.json()).then(data => {
      //   if (data.valid) {
      //     // Handle valid invitation
      //   }
      // });
    } else {
      // Handle case where invitation ID is not present
    }
  }, []);

  const fetchInvitation = async () => {
    console.log('fetching invitation');
    const res = await fetch("/api/getInvitation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Specify the content type
      },
      body: JSON.stringify({ invitationID: invitationID }), // Ensure this is a valid JSON object
    });
    const data = await res.json();
    console.log("data from response", data);
    return data;
  };

  const addNewUser = async () => {
    const userName = `${user.firstName} ${user.lastName}`;

    const invitation = await fetchInvitation();

    console.log("Invitation inside add user:", invitation);

    const groupName = invitation.publicMetadata.group;
    console.log("Group Name:", groupName);

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
        } else {
          alert("User already exists in this group");
          return;
        }
      }

      // add new member to group
      const groupSnap = await getDoc(groupDocRef);
      if (!groupSnap.exists()) {
        alert("Group does not exist");
        return;
      } else {
        const groupData = groupSnap.data();
        if (!groupData.members.includes(userName)) {
          batch.update(groupDocRef, {
            members: [...groupData.members, { name: userName, leader: false, owe: 0}],
          });
        } else {
          alert("User already exists in this group");
          return;
        }
      }

      // Commit the batch
      await batch.commit();

      // Clear the input field
    } catch (error) {
      console.error("Error creating group:", error);
      alert("An error occurred while creating the group. Please try again.");
    }
  };

  useEffect(() => {
    if (isSignedIn && user) {
      console.log("User has signed in!");
      addNewUser();
      //change this to direct to the group page instead
      router.push("/dashboard");
      // Perform any logic you want after the user has signed in
    } else {
      console.log("User is not signed in.");
    }
  }, [isSignedIn, user]);

  // If there is no invitation token, restrict access to the sign-up page
  if (!ticket) {
    return <p>You need an invitation to sign up for this application.</p>;
  }

  // Display the initial sign-in form
  return (
    <>
      <SignedOut>
        <Box
          width="100vw"
          height="90vh"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Typography
            variant="h4"
            textAlign="center"
            color={`${green_dark}`}
            my={8}
            borderBottom={`2px solid ${green_main}`}
          >
            Join the Waitlist!
          </Typography>
          <SignIn />
        </Box>
      </SignedOut>
    </>
  );
}
