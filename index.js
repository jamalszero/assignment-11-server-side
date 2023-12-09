const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

//mongodb start
const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.DB_PASS}@cluster0.zhz6fpd.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    const assignmentCollection = client.db('e-schoolDB').collection('allAssignments');

    app.post("/allassignments", async (req, res) => {
      const assignment = req.body;
      console.log(assignment);
      const result = await assignmentCollection.insertOne(assignment);
      res.send(result);
    });

    app.get("/allassignments", async (req, res) => {
      const allAssignments = assignmentCollection.find();
      const result = await allAssignments.toArray();
      res.send(result);
    });

    app.patch("/updateassignment", async (req, res) => {
      const id = req.body._id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedAssignment = req.body;
      const assignment = {
        $set: {
          title: updatedAssignment.title,
          marks: updatedAssignment.marks,
          level: updatedAssignment.level,
          image_url: updatedAssignment.image_url,
          duedate: updatedAssignment.duedate,
          description: updatedAssignment.description
        }
      };
      const result = await assignmentCollection.updateOne(query, assignment, options);
      res.send(result)
    });

    app.delete("/deleteassignment", async(req, res) => {
      const id = req.body.id;
      const query = { _id: new ObjectId(id)};
      const result = await assignmentCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/allassignments/:level", async(req, res) => {
      const level = req.params.level;
      const query = {level: level};
      const cursor = assignmentCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
//mongodb end

app.get('/', (req, res) => {
  res.send('Server is running...')
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});