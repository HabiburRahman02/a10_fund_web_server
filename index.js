const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const userCollection = client.db('campaignDB').collection('user');

        // campaign related apis
        app.get('/campaign', async (req, res) => {
            const result = await campaignCollection.find().toArray();
            res.send(result);
        })

        app.get('/campaign/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const result = await campaignCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/campaignByRunning/running', async (req, res) => {
            const currentDate = new Date().toISOString().split('T')[0];
            console.log(currentDate);
            const findBy = { deadline: { $gt: currentDate } }
            const query = campaignCollection.find(findBy).limit(6)
            const result = await query.toArray();
            console.log(result);
            res.send(result);
        })

        app.get('/campaignById/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await campaignCollection.findOne(query)
            res.send(result)
        })

        app.post('/campaign', async (req, res) => {
            const campaign = req.body;
            const result = await campaignCollection.insertOne(campaign);
            res.send(result);
        })

        app.delete('/campaign/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await campaignCollection.deleteOne(query);
            res.send(result)
        })
        // const updatedCampaign = { title, type, deadline, amount, photoUrl, description }
        app.patch('/campaign/:id', async (req, res) => {
            const id = req.params.id;
            const campaign = req.body;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateCampaign = {
                $set: {
                    title: campaign.title,
                    type: campaign.type,
                    deadline: campaign.deadline,
                    amount: campaign.amount,
                    photoUrl: campaign.photoUrl,
                    description: campaign.description,
                },
            };
            const result  = await campaignCollection.updateOne(filter,updateCampaign,options);
            res.send(result)
        })

        // user related apis
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
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