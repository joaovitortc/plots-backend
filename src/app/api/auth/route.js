import { MongoClient } from 'mongodb';
import { ethers } from 'ethers';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const POST = async (req, res) => {
  console.log("handler called");

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { address, signature, message } = body;
  const originalAddress = address.address;

  if (!originalAddress || !signature || !message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  try {
    // Using verifyMessage to get the address from the signature (doc. https://docs.ethers.org/v5/api/utils/signing-key/)
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // debugging, this addresses should be the same
    //console.log("Recovered address:", recoveredAddress);
    //console.log("Original address:", originalAddress);

    if (recoveredAddress.toLowerCase() !== originalAddress.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
    }

    await client.connect();
    const db = client.db(); 
    const collection = db.collection('users');

    const existingUser = await collection.findOne({ originalAddress });

    // if user already exists, return the user, if not create a new one
    if (existingUser) {
      return new Response(JSON.stringify({ message: 'User already exists', user: existingUser }), { status: 200 });
    }

    const newUser = {
      originalAddress,
      createdAt: new Date(),
    };

    await collection.insertOne(newUser);

    return new Response(JSON.stringify({ message: 'User created', user: newUser }), { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  } finally {
    // Close mongo
    await client.close();
  }
};

export const GET = async (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const message = `
    Hey, this is a test for signing :)

    Timestamp: ${timestamp}
    Random nonce: ${Math.floor(Math.random() * 1e16).toString(36) + Date.now().toString(36)}
  `;
  return new Response(JSON.stringify({ message }), { status: 200 });
};
