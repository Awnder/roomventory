// pages/api/webhook.js
import { NextResponse } from "next/server";

//import React, { useState, useEffect } from "react";
//import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, useSignUp } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { db } from "/firebase";
import { writeBatch, doc, collection, getDoc, getDocs } from "firebase/firestore";

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET; // Make sure to set this in your environment variables

/*
const fetchInvitation = async () => {
    console.log("fetching invitation");
    const res = await fetch("/api/getInvitation", {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, FETCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "application/json", // Specify the content type
      },
      body: JSON.stringify({ invitationID: invitationID }), // Ensure this is a valid JSON object
    });
    const data = await res.json();
    console.log("data from response", data);
    return data;
  };
  */

export async function POST(req) {
  /*
  const signature = req.headers.get("clerk-signature");
  console.log("Signature:", signature);

  if (!signature) {
    return new Response("Signature missing", { status: 400 });
  }

  const hmac = crypto.createHmac("sha256", CLERK_WEBHOOK_SECRET);
  consol.log('hma', hmac)
  hmac.update(await req.text());
  const digest = hmac.digest("hex");
  console.log("Digest:", digest);

  if (digest !== signature) {
    return new Response("Invalid signature", { status: 400 });
  }
    */

  /*
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ticket, setTicket] = useState(null);
  const [invitationID, setInvitationID] = useState(null);
  const router = useRouter();
  */

  const event = await req.json();
  console.log("Event:", event);

  const addNewUser = async () => {
    /*
    const invitation = await fetchInvitation();

    console.log("Invitation inside add user:", invitation);

    const groupName = invitation.publicMetadata.group;
    const invitorID = invitation.publicMetadata.invitorID;

    console.log("Group Name:", groupName);
    */

    const groupName = event.data.public_metadata.group;
    console.log("Group Name:", groupName);
    const invitorID = event.data.public_metadata.invitorID;
    console.log("Invitor ID:", invitorID);
    const email = event.data.email_address;
    console.log("Email:", email);
    const userID = event.data.public_metadata.userID;
    console.log("User ID:", userID);
    const userName = event.data.public_metadata.userName;
    console.log("User Name:", userName);

    const batch = writeBatch(db);
    const InvitorDocRef = doc(collection(db, "users"), invitorID);
    const invitorSnap = await getDoc(InvitorDocRef);
    const invitorData = invitorSnap.data();

    const groupID = invitorData.groups.find(
      (group) => group.name === groupName
    ).id;

    const groupDocRef = doc(collection(db, "groups"), groupID);

    const userDocRef = doc(collection(db, "users"), userID);

    try {
      // Check if user exists
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        // Create user if it does not exist
        const newUser = {
          ID: userID,
          name: userName,
          groups: [{ name: groupName, id: groupID }],
          email: email,
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
          batch.update(userDocRef, {
            groups: [
              ...userSnap.data().groups,
              { name: groupName, id: groupID },
            ],
          });
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
            members: [
              ...groupData.members,
              { name: userName, leader: false, owe: 0, id: userID },
            ],
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

  const createnewUser = async () => {

    const userID = event.data.id;
    console.log("User ID:", userID);
    const userName = event.data?.first_name + " " + event.data?.last_name;
    console.log("User Name:", userName);
    const email = event.data.email_addresses[0].email_address;

    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, "users"), userID);

    const userCollection = collection(db, "users");
    const userSnapshot = await getDocs(userCollection);
    let userExists = false;
    userSnapshot.forEach((doc) => {
      if (doc.data().email === email) {
        userExists = true;
      }
    });

    if (userExists) {
      console.log("User already exists");
      return;
    }


    try {
      // Check if user exists
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        // Create user if it does not exist
        const newUser = {
          ID: userID,
          name: userName,
          groups: [],
          email: email,
        };
        batch.set(userDocRef, newUser);
      } else {
        console.log("User already exists");
      }

      // Commit the batch
      await batch.commit();

      // Clear the input field
    } catch (error) {
      console.error("Error creating group:", error);
      alert("An error occurred while creating the group. Please try again.");
    }
  };

  if (event.type === "organizationInvitation.accepted") {
    // const user = event.data.user;
    //console.log("User accepted invitation:", user);
    await addNewUser();
  }
  if (event.type === "user.created") {
    await createnewUser();
  }

  return new NextResponse(JSON.stringify({ message: "Event received" }), {
    status: 200,
  });
}
