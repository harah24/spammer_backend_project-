import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send({ success: true, message: "Welcome to Spammer!" });
});

// GET all messages

app.get("/messages", async (req, res) => {
  const messages = await prisma.message.findMany({
    include: { children: true },
  });
  res.send({ success: true, messages });
});

// POST - create messages

app.post("/messages", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.send({
      success: false,
      error: " Please include a message in your update request.",
    });
  }

  const newMsg = await prisma.message.create({
    data: { text },
  });

  res.send({ success: true, newMsg });
});

// PUT - update messages

app.put("/messages/:messageId", async (req, res) => {
  const messageId = req.params.messageId;
  const { text, likes } = req.body;

  const checkMsg = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (checkMsg === null) {
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

  res.send({ success: true, updatedMsg });
});

// DELETE - remove messages

app.delete("/messages/:messageId", async (req, res) => {
  const messageId = req.params.messageId;

  const targetedId = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (targetedId === null) {
    return res.send({
      success: false,
      error: "Couldn't find ID, please enter a valid ID",
    });
  }

  const message = await prisma.message.delete({ where: { id: messageId } });
  res.send({ success: true, message });
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
