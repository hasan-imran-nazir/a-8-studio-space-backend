import express from 'express'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config';
import cors from "cors"
const app = express()

const PORT = 8000;
app.use(cors())
app.use(express.json())


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
const mongoClient = await connectToMongoDB()
const db = mongoClient.db("studios")
const studioCollection = db.collection("studio")
const bookingCollection = db.collection("booking")

app.post('/add-studio', async (req, res) => {
    const data = req.body
    const result = await studioCollection.insertOne(data)
    console.log(result)
    res.send(result)
})

app.get('/studios', async (req, res) => {
    const result = await studioCollection.find().toArray()
    res.send(result)
})
app.get('/studios/:id', async (req, res) => {
    const { id } = req.params
    const result = await studioCollection.findOne({ _id: new ObjectId(id) })
    res.send(result)
})

app.patch('/studios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const result = await studioCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Studio not found" });
        }

        res.status(200).json({ message: "Studio updated successfully", result });
    } catch (error) {
        res.status(500).json({ error: "Invalid ID or server error" });
    }
});
app.delete('/studios/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid studio id" });
        }

        const result = await studioCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Studio not found" });
        }

        res.status(200).json({ message: "Studio deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/add-booking', async (req, res) => {
    const data = req.body
    const result = await bookingCollection.insertOne(data)
    console.log(result)
    res.send(result)
})

app.get('/bookings', async (req, res) => {
    try {
        const { email } = req.query;
        const query = email ? { email } : {};
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

app.get('/my-bookings/:email', async (req, res) => {
    const { email } = req.params;
    const result = await bookingCollection.find({ email: email }).toArray()
    res.send(result)
})

app.delete('/mybookings/:id', async (req, res) => {
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

app.get('/mybookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = ObjectId.isValid(id)
            ? { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
            : { _id: id };
        const result = await bookingCollection.deleteOne(query);
        console.log("Deleted booking (GET):", id, result);
        res.send(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to delete booking" });
    }
});

app.get('/', (req, res) => {
    res.send({ Message: 'Server working' })
})

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})
