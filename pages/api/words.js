import clientPromise from "../../lib/mongo";
export default async function handler(req, res) {

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    const client = await clientPromise;
    const wordsCollection = client.db("word_learning").collection("words");

    if (req.method === "GET") {
      const words = await wordsCollection.find({}).toArray();
      return res.status(200).json(words);
    }

    if (req.method === "POST") {
      // Log what the server receives for debugging
      console.log("Server received body:", req.body);

      const { word, type, meaning, synonyms, examples } = req.body;

      if (!word || !meaning) {
        return res.status(400).json({ error: "Word and meaning required" });
      }

      try {
        const result = await wordsCollection.insertOne({
          word,
          type,
          meaning,
          synonyms,
          examples, // already an array from client
        });

        return res.status(201).json({
          _id: result.insertedId,
          word,
          type,
          meaning,
          synonyms,
          examples,
        });
      } catch (err) {
        console.error("Failed to add word:", err);
        return res.status(500).json({ error: "Failed to add word", details: err.message });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
