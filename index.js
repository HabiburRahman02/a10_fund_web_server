const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster3.ggy8e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster3`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const campaignCollection = client.db('campaignDB').collection('campaign');

        // campaign related apis
        app.get('/campaign', async (req, res) => {
            const result = await campaignCollection.find().toArray();
            res.send(result);
        })

        app.get('/campaign/running', async (req, res) => {
            // const deadline = req.body.deadline;
            const currentDate = new Date()
            const findBy = { deadline: { $gt: currentDate.toISOString().split('T')[0] } }
            const query = campaignCollection.find(findBy).limit(6)
            const result = await query.toArray();
            res.send(result);
        })

        app.post('/campaign', async (req, res) => {
            const campaign = req.body;
            const result = await campaignCollection.insertOne(campaign);
            res.send(result);
        })




        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Funding server is running!')
})

app.listen(port, () => {
    console.log(`Funding server is running on port ${port}`)
})