const { z } = require("zod");
const { login } = require("../services/auth.service");

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});

async function loginController(req, res) {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });

  const token = await login({ ...parsed.data, jwtSecret: process.env.JWT_SECRET });
  if (!token) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ data: token });
}

module.exports = { loginController };