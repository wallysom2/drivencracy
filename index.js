import express, { json } from "express";
import joi from "joi";
import db from "./db.js";
import bodyParser from "body-parser";


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
        const choice = await db.collection("polls").find({ pollId })
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

app.get("/choice/:pollId", async (req, res) => {
    try {
        const pollId = req.params.pollId;
        const choices = await db.collection("choices").find({ pollId }).toArray();
        if (choices == "") return res.status(404).send("Poll not found");
        res.send(choices);

    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

//criando voto

app.post("/choice/vote/:id", async (req, res) => {
    try {
        const choiceId = req.params.id;
        const choice = await db.collection("choices").find({ choiceId }).toArray();
        if (!choice) return res.status(404).send("choice not found");
        const voto = await db.collection("votes").insertOne({
            choiceId
        });
        if (!voto) return res.status(500).send("Não foi possivel inserir o voto");
        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

//  mostrar opção mais votada

app.get("/choice/vote/:id", async (req, res) => {
    try {
        const choiceId = req.params.id;
        const choice = await db.collection("choices").find({ choiceId }).toArray();
        if (!choice) return res.status(404).send("choice not found");
        const voto = await db.collection("votes").find({ choiceId }).toArray();
        if (!voto) return res.status(404).send("choice not found");
        res.send(voto);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
