import { createClerkClient } from "@clerk/backend";
import { NextResponse } from "next/server";
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

export async function POST(req) {
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const { email, group, invitorID } = await req.json();

  //const invitations = await clerkClient.invitations.getInvitationList();
  //const invitationId = invitations.data[0].id;

  //console.log('invitations', invitations)
  //console.log('invitationID', invitationId)

  //const revoke = await clerkClient.invitations.revokeInvitation(invitationId)

  // Log the request and email for debugging
  //console.log('req', req);
  //console.log('email', email);
  //console.log('group', group);

  const customID = "custom-" + Date.now();

  /*const response = await clerkClient.invitations.createInvitation({
    emailAddress: email,
    ignoreExisting: true,
    redirectUrl: `http://localhost:3000/invitation?invitation_id=${customID}`,
    publicMetadata: {
      group: group,
      id: customID,
      invitorID: invitorID
    },
  });*/

  const userCollection = collection(db, "users");
  const userSnapshot = await getDocs(userCollection);
  let userExists = false;
  let userID = "";
  let userName = "";
  userSnapshot.forEach((doc) => {
    if (doc.data().email === email) {
      userExists = true;
      userID = doc.id;
      userName = doc.data().name;
    }
  });
  console.log('userID', userID);
  console.log('userName', userName);

  const randomName = Math.random().toString(36).substring(2, 10);

  const newOrganization = await clerkClient.organizations.createOrganization({ name: randomName, createdBy: invitorID });
  const organizationID = newOrganization.id;
  console.log("id", customID);


  let response = null;

  if (userExists) {
    response =
      await clerkClient.organizations.createOrganizationInvitation({
        organizationId: organizationID,
        emailAddress: email,
        inviterUserId: invitorID,
        role: "org:member",
        redirectUrl: "https://roomventory.site/signin",
        publicMetadata: {
          group: group,
          id: customID,
          invitorID: invitorID,
          userID: userID,
          userName: userName,
        },
      });
  }
  else
  {
    console.log('user does not exist');
  }


  return new NextResponse(response);
}
