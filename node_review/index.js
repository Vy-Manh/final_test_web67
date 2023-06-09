const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

const mongoUrl = "mongodb://localhost:27017";
const dbName = "final_test";
const collectionName = "Inventories";

const connectToDb = (callback) => {
  MongoClient.connect(mongoUrl, (err, client) => {
    if (err) {
      console.error("Error connecting to MongoDB:", err);
      callback(err);
      return;
    }

    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    callback(null, collection);
  });
};

app.get("/products", (req, res) => {
  connectToDb((err, collection) => {
    if (err) {
      res.status(500).json({ error: "Failed to connect to the database" });
      return;
    }

    collection.find().toArray((error, products) => {
      if (error) {
        console.error("Error retrieving products:", error);
        res.status(500).json({ error: "Failed to retrieve products" });
        return;
      }

      res.json(products);
    });
  });
});

app.get("/products/low-quantity", (req, res) => {
  connectToDb((err, collection) => {
    if (err) {
      res.status(500).json({ error: "Failed to connect to the database" });
      return;
    }

    const query = { quantity: { $lt: 100 } };

    collection.find(query).toArray((error, products) => {
      if (error) {
        console.error("Error retrieving products:", error);
        res.status(500).json({ error: "Failed to retrieve products" });
        return;
      }

      res.json(products);
    });
  });
});

app.post("/login", express.json(), (req, res) => {
  const token = "your_generated_token";
  res.json({ token });
});

app.get("/protected", (req, res) => {
  res.json({ message: "Protected resource accessed successfully" });
});

app.get("/orders", (req, res) => {
  connectToDb((err, collection) => {
    if (err) {
      res.status(500).json({ error: "Failed to connect to the database" });
      return;
    }

    collection.aggregate([
      {
        $lookup: {
          from: "products", 
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          _id: 1,
          orderNumber: 1,
          quantity: 1,
          product: {
            _id: "$product._id",
            name: "$product.name",
            description: "$product.description",
          },
        },
      },
    ]).toArray((error, orders) => {
      if (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).json({ error: "Failed to retrieve orders" });
        return;
      }

      res.json(orders);
    });
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});