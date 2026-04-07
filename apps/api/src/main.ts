import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

app.register(cors, { origin: true, credentials: true });
app.register(cookie);

type JwtPayload = { userId: string; email: string };

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

app.post("/auth/register", async (request, reply) => {
  const data = authSchema.parse(request.body);
  const passwordHash = await argon2.hash(data.password);
  const user = await prisma.user.create({
    data: { email: data.email, passwordHash }
  });
  await prisma.account.create({
    data: { userId: user.id, name: "Konto główne" }
  });
  return reply.send({ id: user.id, email: user.email });
});

app.post("/auth/login", async (request, reply) => {
  const data = authSchema.parse(request.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) return reply.status(401).send({ message: "Nieprawidłowe dane logowania" });
  const ok = await argon2.verify(user.passwordHash, data.password);
  if (!ok) return reply.status(401).send({ message: "Nieprawidłowe dane logowania" });
  const accessToken = jwt.sign({ userId: user.id, email: user.email } satisfies JwtPayload, JWT_SECRET, {
    expiresIn: "15m"
  });
  const refreshToken = jwt.sign({ userId: user.id, email: user.email } satisfies JwtPayload, JWT_SECRET, {
    expiresIn: "7d"
  });
  reply.setCookie("refresh_token", refreshToken, { path: "/", httpOnly: true, sameSite: "lax" });
  return reply.send({ accessToken });
});

app.addHook("preHandler", async (request, reply) => {
  if (request.url.startsWith("/auth") || request.url === "/health") return;
  const auth = request.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return reply.status(401).send({ message: "Brak tokenu" });
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as JwtPayload;
    (request as typeof request & { userId: string }).userId = payload.userId;
  } catch {
    return reply.status(401).send({ message: "Nieprawidłowy token" });
  }
});

app.get("/health", async () => ({ status: "ok" }));

const transactionSchema = z.object({
  accountId: z.string(),
  kind: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  category: z.string().min(2),
  tags: z.array(z.string()).default([]),
  date: z.string(),
  note: z.string().optional()
});

app.get("/transactions", async (request) => {
  const userId = (request as typeof request & { userId: string }).userId;
  return prisma.transaction.findMany({ where: { userId }, orderBy: { date: "desc" } });
});

app.post("/transactions", async (request) => {
  const userId = (request as typeof request & { userId: string }).userId;
  const data = transactionSchema.parse(request.body);
  return prisma.transaction.create({
    data: { ...data, userId, amount: data.amount, date: new Date(data.date) }
  });
});

app.post("/budgets", async (request) => {
  const userId = (request as typeof request & { userId: string }).userId;
  const schema = z.object({
    category: z.string(),
    month: z.string(),
    limitAmount: z.number().positive()
  });
  const data = schema.parse(request.body);
  return prisma.budget.create({
    data: { ...data, userId }
  });
});

app.post("/import/csv", async (request) => {
  const userId = (request as typeof request & { userId: string }).userId;
  const body = z.object({ rows: z.array(z.record(z.string())) }).parse(request.body);
  const account = await prisma.account.findFirst({ where: { userId } });
  if (!account) return { imported: 0 };
  const mapped = body.rows.map((row) => ({
    userId,
    accountId: account.id,
    kind: (row.kind || "expense") as "income" | "expense",
    amount: Number(row.amount || 0),
    category: row.category || "Inne",
    tags: row.tags ? row.tags.split(",") : [],
    date: new Date(row.date || new Date().toISOString()),
    note: row.note || undefined
  }));
  await prisma.transaction.createMany({ data: mapped });
  return { imported: mapped.length };
});

app.get("/dashboard", async (request) => {
  const userId = (request as typeof request & { userId: string }).userId;
  const [transactions, subscriptions, bills, budgets] = await Promise.all([
    prisma.transaction.findMany({ where: { userId } }),
    prisma.subscription.findMany({ where: { userId } }),
    prisma.bill.findMany({ where: { userId } }),
    prisma.budget.findMany({ where: { userId } })
  ]);
  const balance = transactions.reduce((acc, tx) => {
    const amount = Number(tx.amount);
    return tx.kind === "income" ? acc + amount : acc - amount;
  }, 0);
  return {
    balance,
    subscriptionsMrr: subscriptions
      .filter((s) => s.period === "monthly")
      .reduce((acc, s) => acc + Number(s.amount), 0),
    upcomingBills: bills.filter((b) => b.dueDate >= new Date()).length,
    budgetCount: budgets.length
  };
});

app.listen({ port: Number(process.env.PORT || 4000), host: "0.0.0.0" });
