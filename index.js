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

app.get('/', (req, res) => {
    res.send({ Message: 'Server working' })
})

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})