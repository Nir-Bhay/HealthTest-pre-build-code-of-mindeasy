const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const recombee = require('recombee-api-client');
const rqs = recombee.requests;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const uri = process.env.MONGODB_URI; // Use environment variable for MongoDB URI
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");
    } catch (err) {
        console.error("Error connecting to MongoDB Atlas:", err);
    }
}
run();

let formDataCollection;

async function initializeCollections() {
    const database = client.db("MindEas-data");
    formDataCollection = database.collection("formData");
}
initializeCollections();
var clientre = new recombee.ApiClient('error-mindeas', 'PbBaEVxx8ZOj0x3BhGtqfHyi8qQ8rm8rE1JBnSPoCnHwetzO3gjHer96YVAIa14G');



async function sendToRecombee(formData, quizResponses) {
    try {
        // Extract necessary data from formData and quizResponses
        const userData = {
            userId: formData.name, // Use a unique identifier for the user, such as their name
            age: formData.age,
            gender: formData.gender,
            // Add other user data fields as needed
        };

        // Send user data to Recombee
        await clientre.send(new rqs.SetUserValues(userData.userId, userData));

        // Process quiz responses and send them to Recombee
        for (const response of quizResponses) {
            const itemId = response.question; // Use the question as the unique identifier for each item
            const itemData = {
                question: response.question,
                answer: response.answer,
                // Add other item data fields as needed
            };

            // Send item data to Recombee
            await clientre.send(new rqs.SetItemValues(itemId, itemData));
        }

        console.log('Data sent to Recombee successfully');
    } catch (error) {
        console.error('Error sending data to Recombee:', error);
    }
}

// Modify your route handler to call the sendToRecombee function
app.post('/save-form-data', async (req, res) => {
    const { formData, quizResponses } = req.body;

    try {
        // Save both form data and quiz responses to the database
        await formDataCollection.insertOne({ formData, quizResponses });

        // Send data to Recombee
        await sendToRecombee(formData, quizResponses);

        // Send response to the client
        res.json({ message: 'Form data and quiz responses saved successfully.' });
    } catch (err) {
        console.error("Error saving form data and quiz responses:", err);
        res.status(500).json({ error: 'Failed to save form data and quiz responses.' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
