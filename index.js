import express, { json } from "express";
import joi from "joi";

import db from "./db.js";


const app = express();
app.use(json());

//criando uma poll
app.post("/poll", async (req, res) => {
    const { title, expireAt } = req.body;
    //validação joi
    const schema = joi.object({
        title: joi.string().required(),
        expireAt: joi.date()
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) return res.status(422).send(error.details[0].message);
   
    try {
        await db.collection("polls").insertOne({
            title,
            expireAt
        });
        res.sendStatus(201);

    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

//listando todas as polls
app.get("/poll", async (req, res) => {
    try {
        const polls = await db.collection("polls").find({}).toArray();
        res.send(polls);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

// Criando uma opção
app.post("/choice", async (req, res) => {
    const { title,pollId} = req.body;
    //validação joi
    const schema = joi.object({
        title: joi.string().required(),
        pollId: joi.string().required()       
        })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) return res.status(422).send(error.details[0].message);

    // somente criar uma opção se a poll existir
    try {
        const poll = await db.collection("polls").findOne({ _id: pollId });
        if (!poll) return res.status(404).send("Poll not found");
        await db.collection("choices").insertOne({
            title,
            pollId
        });
        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});



const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});