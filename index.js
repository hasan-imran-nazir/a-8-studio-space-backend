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

app.get('/', (req, res) => {
    res.send({ Message: 'Server working' })
})

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})