import { createClerkClient } from "@clerk/backend";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const { invitationID } = await req.json();
  console.log("Invitation ID:", invitationID);

  const invitations = await clerkClient.invitations.getInvitationList();

  console.log('invitations', invitations);

  const data = invitations.data;

  console.log('data', data)


  const matchingInvitation = data.find(invitation => 
    invitation.publicMetadata?.id === invitationID
  );
  
  if (matchingInvitation) {
    console.log("Matching Invitation:", matchingInvitation);
    // Handle the matching invitation
  } else {
    console.log("No matching invitation found.");
    // Handle the case where no matching invitation is found
  }

  return NextResponse.json(matchingInvitation);
}
