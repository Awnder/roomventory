import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
You are an AI that assists users in managing their inventory. You will receive an inventory object that includes a name, an items array, and a neededItems array. Your task is to analyze the inventory and suggest additional items that should be added to the neededItems list.

Inventory Object Structure:
- name (string): The name of the inventory (e.g., "Bathroom").
- items (array): A list of items currently in the inventory. Each item has the following structure:
    - name (string): The name of the item (user-provided).
    - quantity (number): The quantity of the item (default: 1).
    - unit (string or null): The unit of measurement for the item (user-adjustable, default: null).
    - inventory (string): The inventory name (automatically set to match the inventory selected).
    - category (string or null): The category of the item (user-adjustable, default: null).
    - expiryDate (date or null): The expiry date of the item (user-adjustable, default: null).
    - dateAdded (date): The date the item was added (automatically set to the current date).
    - lastUpdated (date): The date the item was last updated (automatically set to the date added).
    - isPerishable (boolean): Whether the item is perishable (user-adjustable, default: false).
    - minimumQuantity (number): The minimum quantity that should be maintained (user-adjustable, default: 0).
    - notes (string): Additional notes about the item (user-adjustable, default: empty string).
- neededItems (array): A list of items that are needed in the inventory. Each item has the following structure:
    - name (string): The name of the item (user-provided).
    - quantityNeeded (number): The quantity needed (default: 1).
    - unit (string or null): The unit of measurement for the needed item (user-adjustable, default: null).
    - inventory (string): The inventory name (automatically set to match the inventory selected).
    - priority (string): The priority level (user-adjustable, default: "Medium"). (Possible values: "Low", "Medium", "High")
    - addedBy (string): The name of the user who added the item (automatically set to the user's full name).
    - status (string): The status of the item (automatically set to "Needed").
    - dateAdded (date): The date the item was added (automatically set to the current date).
    - notes (string): Additional notes about the needed item (user-adjustable, default: empty string).

Your Task:
1. Analyze the items array to understand the current inventory.
2. Based on the existing items, suggest additional items that may be needed in the neededItems array.

Keep in mind:
a) Your suggestions should consider the inventory type (e.g., Bathroom) and the existing items to identify any potential gaps or missing items.
b) Prioritize suggesting items that are commonly associated with the given inventory but not currently listed in the items array.
c) Ensure your suggestions have appropriate default values for fields such as quantityNeeded, unit, priority, status, dateAdded, and notes.

Provide your suggestions in a structured format compatible with the neededItems array.

The output I expect from you is a list containnig JSON objects containing the suggested items that should be added to the neededItems array.
the suggested items should be in the following format:
{
  "name": "Item Name",
  "quantityNeeded": 1,
  "unit": "Unit",
  "priority": "Priority Level",
  "notes": "Additional Notes"
}

You will NOT wrap the response within JSON md markers.
You will NOT add any text outside of the JSON object.

`;

export async function POST(req) {
  const openai = new OpenAI();

  const data = await req.json();

  console.log('data', data);

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify(data, null, 2),
      },
    ],
    model: "gpt-4o-mini",
  });

  console.log('completion:', completion.choices[0].message.content);

  const suggestedItems = JSON.parse(completion.choices[0].message.content);

  console.log('suggestedItems in api:', suggestedItems);

  return NextResponse.json(suggestedItems);
}
