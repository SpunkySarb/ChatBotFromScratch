/**author:Sarbjeet Singh, contact:https://www.sarbzone.com*/

const express = require("express");
const path = require("path");

const use = require("@tensorflow-models/universal-sentence-encoder");
const tf = require("@tensorflow/tfjs-node");
const getRandomAnswer = require("./Responses");

tf.setBackend("cpu");

const root = path.resolve(__dirname);

let model;
let embedder;

const loadModel = async () => {
  try {
    model = await tf.loadLayersModel(`file://${root}/model/model.json`);
    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

const loadUSE = async () => {
  try {
    embedder = await use.load();
    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

const app = express();

app.use(express.json());

app.use(express.static("public"));

loadModel()
  .then(() => {
    loadUSE()
      .then(() => {
        res.send("");
      })
      .catch((err) => {
        console.log(err.message);
      });
  })
  .catch((err) => {
    console.log(err.message);
  });

// Define a route for the homepage
app.get("/", (req, res) => {
  res.send("");
});

app.post("/send", (req, res) => {
  try {
    const message = req.body.message;

    embedder
      .embed([message])
      .then((embeddings) => {
        const pred = model.predict(embeddings);
        const predArr = pred.dataSync();
        const predClassNum = predArr.indexOf(Math.max(...predArr));

        const response = getRandomAnswer(predClassNum);
        console.log(response);
        res.json({ received: true, message: response });
      })
      .catch((err) => {
        console.log(err.message);

        res.json({
          received: true,
          message: "Please Wait for models To Load First...",
        });
      });
  } catch (err) {
    res.json({
      received: true,
      message: "Please Wait for models To Load First...",
    });
  }
});

app.use(express.json());
app.listen(process.env.PORT || 3001);
