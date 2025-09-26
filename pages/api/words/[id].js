import clientPromise from "../../../lib/mongo";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { id } = req.query;



  // Inside your serverless function handler
  const allowedOrigins = [
    "http://localhost:5173",                       // local dev
    "https://word-learning-lyart.vercel.app",     // Vercel frontend
    "https://chipper-moonbeam-9ae359.netlify.app" // Netlify frontend
  ];

  const origin = req.headers.origin;

  // Dynamically set Access-Control-Allow-Origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  // Standard CORS headers
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const client = await clientPromise;
    const wordsCollection = client.db("word_learning").collection("words");

    if (req.method === "GET") {
      const word = await wordsCollection.findOne({ _id: new ObjectId(id) });
      if (!word) return res.status(404).json({ error: "Word not found" });
      return res.status(200).json(word);
    }

    if (req.method === "PUT") {
      const updatedWord = { ...req.body };
      delete updatedWord._id;

      const result = await wordsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatedWord },
        { returnDocument: "after" }
      );

      if (!result.value) return res.status(404).json({ error: "Word not found" });
      return res.status(200).json(result.value);
    }

    if (req.method === "DELETE") {
      const result = await wordsCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) return res.status(404).json({ error: "Word not found" });
      return res.status(200).json({ message: "Word deleted successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
