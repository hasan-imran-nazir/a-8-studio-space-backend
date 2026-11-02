import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import cors from "cors";
import { jwtVerify, createRemoteJWKSet } from "jose";
const app = express();

const PORT = 8000;
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongoClient = await connectToMongoDB();
const db = mongoClient.db("studios");
const studioCollection = db.collection("studio");
const bookingCollection = db.collection("booking");

const AUTH_URL = process.env.BETTER_AUTH_URL;
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
);

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await jwtVerify(token, JWKS);
    next();
  } catch (err) {
    console.error("JWT Verification Failed:", err.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

app.post("/add-studio", verifyToken, async (req, res) => {
  const data = req.body;
  const result = await studioCollection.insertOne(data);
  console.log(result);
  res.send(result);
});

app.get("/studios", async (req, res) => {
  const result = await studioCollection.find().toArray();
  res.send(result);
});
app.get("/studios/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid studio id" });
  }
  const result = await studioCollection.findOne({ _id: new ObjectId(id) });
  if (!result) {
    return res.status(404).json({ error: "Studio not found" });
  }
  res.send(result);
});

app.patch("/studios/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const result = await studioCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Studio not found" });
    }

    res.status(200).json({ message: "Studio updated successfully", result });
  } catch (error) {
    res.status(500).json({ error: "Invalid ID or server error" });
  }
});
app.delete("/studios/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid studio id" });
    }

    const result = await studioCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Studio not found" });
    }

    res.status(200).json({ message: "Studio deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/add-booking", verifyToken, async (req, res) => {
  const data = req.body;
  const existingBooking = await bookingCollection.findOne({
    studioId: data.studioId,
    bookingDate: data.bookingDate,
    status: "Confirmed",
  });

  if (existingBooking) {
    return res.status(409).json({ error: "This studio is already booked!" });
  }

  const result = await bookingCollection.insertOne(data);
  console.log(result);
  res.send(result);
});

app.get("/bookings", verifyToken, async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { email } : {};
    const result = await bookingCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.get("/my-bookings/:email", verifyToken, async (req, res) => {
  const { email } = req.params;
  const result = await bookingCollection.find({ email: email }).toArray();
  res.send(result);
});

app.delete("/mybookings/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = ObjectId.isValid(id)
      ? { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
      : { _id: id };
    const result = await bookingCollection.deleteOne(query);
    console.log("Deleted booking:", id, result);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

app.get("/my-listings/:hostEmail", verifyToken, async (req, res) => {
  const { hostEmail } = req.params;
  const result = await studioCollection
    .find({ hostEmail: hostEmail })
    .toArray();
  res.send(result);
});

app.get("/", (req, res) => {
  res.send({ Message: "Server working" });
});

app.listen(PORT, () => {
  console.log(process.env.CLIENT_URL);
});
