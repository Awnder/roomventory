import { createClerkClient } from "@clerk/backend";
import { NextResponse } from "next/server";

export async function POST(req) {
  // Run the cors middleware
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

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


    const customID = 'custom-' + Date.now();
  const response = await clerkClient.invitations.createInvitation({
    emailAddress: email,
    ignoreExisting: true,
    redirectUrl: `http://www.roomventory.site/invitation?invitation_id=${customID}`,
    publicMetadata: {
      group: group,
      id: customID,
      invitorID: invitorID
    },
  });

  console.log('id', customID)

  return new NextResponse(response);
}