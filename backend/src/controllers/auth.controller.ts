import express from "express";
import { auth } from "../lib/auth";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const response = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    asResponse: true,
  });

  res.send(response);
});

export default router;
