import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const prisma = new PrismaClient();
const app = express();

app.use(cors());

app.use(express.json());

// GET - route handler

app.get("/", (req, res) => {
  res.send({ success: true, message: "Welcome to Spammer!" });
});

// GET all messages

app.get("/messages", async (req, res) => {
  const messages = await prisma.message.findMany({
    include: {
      children: {
        include: {
          children: { include: { children: { include: { children: true } } } },
        },
      },
    },
  });
  res.send({ success: true, messages });
});

// POST - create messages

app.post("/messages", async (req, res) => {
  try {
    const { text, parentId } = req.body;

    if (!text) {
      return res.send({
        success: false,
        error: " Please include a message in your update request.",
      });
    }

    const message = await prisma.message.create({
      data: { text, parentId },
    });
    res.send({ success: true, message });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// PUT - update messages

app.put("/messages/:messageId", async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const { text, likes } = req.body;

    const checkMsg = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!checkMsg) {
      return res.send({
        success: false,
        error: "Couldn't find ID, please enter a valid ID",
      });
    } else if (!text && !likes) {
      return res.send({
        success: false,
        error:
          "Please provide a new message or a new number of likes for an update.",
      });
    }

    const updatedMsg = await prisma.message.update({
      where: { id: messageId },
      data: { text, likes },
    });

    res.send({ success: true, message: updatedMsg });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// DELETE - remove messages

app.delete("/messages/:messageId", async (req, res) => {
  try {
    const messageId = req.params.messageId;

    const checkMsg = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!checkMsg) {
      return res.send({
        success: false,
        error: "Couldn't find ID, please enter a valid ID",
      });
    }
    await prisma.message.delete({ where: { id: messageId } });
    res.send({ success: true, message: checkMsg });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// overall error handling

app.use((req, res) => {
  res.send({ success: false, error: "No route found." });
});

app.use((error, req, res, next) => {
  res.send({ success: false, error: error.message });
});

// local server

const port = 5000;

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
