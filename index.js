const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors({}))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('hello world sultan')
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pdscwoz.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const userCollection = client.db("taskManagement").collection("userInfo")
const taskCollection = client.db("taskManagement").collection("userTask")



app.post('/api/v1/users-info', async (req, res) => {
  const users = req.body;
  const query = { email: users.email }
  const existingUser = await userCollection.findOne(query)
  if (existingUser) {
    return res.send({ message: 'users already exists', insertedId: null })
  }
  const result = await userCollection.insertOne(users)
  res.send(result)
})

app.get('/api/v1/users-info', async (req, res) => {
  const result = await userCollection.find().toArray();
  res.send(result)
})

app.post('/api/v1/user-task', async (req, res) => {
  const body = req.body;
  const result = await taskCollection.insertOne(body)
  console.log(result);
  res.send(result)
})

app.get('/api/v1/user-task', async (req, res) => {
  const queryEmail = req.query.email
  let query = {};
  if (req.query?.email) {
    query.email = queryEmail
  }
  const result = await taskCollection.find(query).toArray();
  res.send(result)
})
app.get('/api/v1/users-task/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await taskCollection.findOne(query)
  res.send(result)
})

app.delete('/api/v1/user-task/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await taskCollection.deleteOne(query)
  res.send(result)
})

app.patch('/api/v1/user-task-update/:id', async (req, res) => {
  const item = req.body;
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) }
  const updateDoc = {
    $set: {
      title: item.title,
      priority: item.priority,
      deadline: item.deadline,
      description: item.description,
    }
  }
  const result = await taskCollection.updateOne(filter, updateDoc)
  res.send(result)

})


app.listen(port, () => {
  console.log(`pet adoption server port: ${port}`);
})
