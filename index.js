import express, { json } from "express";
import { ObjectId } from 'mongodb';
import joi from "joi";
import db from "./db.js";
import chalk from "chalk";


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

//criando uma opção

app.post("/choice", async (req, res) => {
    const { pollId, title } = req.body;

    const choiceSchema = joi.object({
        title: joi.string().required(),
        pollId: joi.string().required(),
    })
    const { error } = choiceSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(422).send(error.details[0].message);

    try {
        const choice = await db.collection("polls").find({ pollId });
        if (!choice) return res.status(404).send("poll not found");
        const inserirOpcao = await db.collection("choices").insertOne({
            title,
            pollId
        });
        if (!inserirOpcao) return res.status(500).send("Não foi possivel inserir a opção");

        res.sendStatus(201);
    }
    catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

//listando todas as opções

app.get("/choice", async (req, res) => {

    try {
        const choices = await db.collection("choices").find({}).toArray();
        res.send(choices);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

//listando todas as opções de uma mesma poll.


app.get("/poll/:pollId/choice", async (req, res) => {
    const { pollId } = req.params;
    try {
        const choice = await db.collection("choices").find({ pollId }).toArray();
        if (!choice) return res.status(404).send("poll not found");
        res.send(choice);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

//dever votar na opção de uma poll especifica e mostrar a opção que o usuario votou e a quantidade de votos.

app.post("/choice/:id/vote", async (req, res) => {
    try {
        const { id } = req.params;
        const choice = await db.collection("choices").findOne({ _id: ObjectId(id) });
        if (!choice) return res.status(404).send("choice not found");
        const votar = await db.collection("choices").updateOne({ _id: ObjectId(id) }, { $inc: { votes: 1 } });
        if (!votar) return res.status(500).send("Não foi possivel votar");
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

//mostrar a choice (t) mais votada de uma poll

app.get("/poll/:id/result", async (req, res) => {
    try {
        const { id } = req.params;
        const poll = await db.collection("polls").findOne({ _id: ObjectId(id) });
        if (!poll) return res.status(404).send("poll not found");
        const choice = await db.collection("choices").find({ pollId: id }).sort({ votes: -1 }).limit(1);
        if (!choice) return res.status(404).send("choice not found");
        res.send(choice);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(chalk.bold.blue(`server running on port ${port}`));
});
