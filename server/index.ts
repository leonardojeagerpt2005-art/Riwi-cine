import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "..", "db.json");

const EMPTY_DB: Record<string, any[]> = {
  users: [],
  movies: [],
  bookings: [],
  support: [],
  notifications: [],
  showtimes: [],
  snacks: [],
  carts: [],
  verificationTokens: [],
};

function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      const initial = { ...EMPTY_DB };
      fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2));
      return initial;
    }
    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return { ...EMPTY_DB };
  }
}

function writeDb(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const TOKEN_TTL_MS = 15 * 60 * 1000;

function generateVerificationToken() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // ===== AUTH =====
  app.post("/api/auth/request-token", (req, res) => {
    try {
      const { userId } = req.body || {};
      if (userId === undefined || userId === null || userId === "") {
        return res.status(400).json({ error: "El userId es obligatorio." });
      }

      const db = readDb();
      const user = db.users.find((u: any) => u.id == userId);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      if (user.verified) {
        return res
          .status(409)
          .json({ error: "El usuario ya está verificado." });
      }

      const token = generateVerificationToken();
      const expiresAt = Date.now() + TOKEN_TTL_MS;

      db.verificationTokens = (db.verificationTokens || []).filter(
        (t: any) => String(t.userId) !== String(userId)
      );
      db.verificationTokens.push({
        id: Date.now(),
        userId: Number(userId),
        token,
        expiresAt,
      });
      writeDb(db);

      console.log(
        `[AUTH EMAIL DISPATCH] To: ${user.email} | Code: ${token} | Expires: ${new Date(expiresAt).toISOString()}`
      );

      return res.status(200).json({
        message: "Código de verificación enviado al correo del usuario.",
      });
    } catch (e) {
      return res
        .status(500)
        .json({ error: "Error interno al procesar la solicitud." });
    }
  });

  app.post("/api/auth/verify-token", (req, res) => {
    try {
      const { userId, token } = req.body || {};
      if (userId === undefined || token === undefined || token === "") {
        return res
          .status(400)
          .json({ error: "El userId y el token son obligatorios." });
      }

      const db = readDb();
      const record = (db.verificationTokens || []).find(
        (t: any) => String(t.userId) === String(userId) && t.token === token
      );

      if (!record || record.expiresAt < Date.now()) {
        return res
          .status(400)
          .json({ error: "Email o token inválidos / Token expirado." });
      }

      const user = db.users.find((u: any) => u.id == userId);
      if (user) {
        user.verified = true;
      }

      db.verificationTokens = (db.verificationTokens || []).filter(
        (t: any) => t.id !== record.id
      );
      writeDb(db);

      return res.status(200).json({ message: "Token validado con éxito." });
    } catch (e) {
      return res
        .status(500)
        .json({ error: "Error interno al verificar el token." });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "El correo y la contraseña son obligatorios." });
      }

      const db = readDb();
      const user = db.users.find(
        (u: any) => u.email === email && u.password === password
      );
      if (!user) {
        return res.status(401).json({ error: "Credenciales inválidas." });
      }

      return res.status(200).json(user);
    } catch (e) {
      return res
        .status(500)
        .json({ error: "Error interno al iniciar sesión." });
    }
  });

  // ===== CART AND CONCESSIONS =====
  const getCartTotals = (cart: any) => {
    const ticketsSubtotal = (cart.tickets || []).reduce(
      (total: number, ticket: any) =>
        total + ticket.unitPrice * ticket.quantity,
      0
    );
    const snacksSubtotal = (cart.snacks || []).reduce(
      (total: number, item: any) => total + item.unitPrice * item.quantity,
      0
    );
    const subtotal = ticketsSubtotal + snacksSubtotal;
    const promotionDiscount =
      cart.promotionCode === "CINE10" ? subtotal * 0.1 : 0;
    const membershipDiscount = cart.membershipCode ? subtotal * 0.15 : 0;
    const giftcardDiscount = Math.min(
      Number(cart.giftcardAmount) || 0,
      subtotal
    );
    const discount = Math.min(
      subtotal,
      promotionDiscount + membershipDiscount + giftcardDiscount
    );
    const taxableTotal = subtotal - discount;
    const tax = taxableTotal * 0.19;

    return {
      ticketsSubtotal,
      snacksSubtotal,
      subtotal,
      promotionDiscount,
      membershipDiscount,
      giftcardDiscount,
      discount,
      tax,
      total: taxableTotal + tax,
    };
  };

  const normalizeCart = (cart: any) => ({
    ...cart,
    ...getCartTotals(cart),
    updatedAt: new Date().toISOString(),
  });

  app.get("/api/snacks/categories", (_req, res) => {
    const db = readDb();
    const categories = Array.from(
      new Set((db.snacks || []).map((snack: any) => snack.category))
    );
    res.json(categories);
  });

  app.get("/api/snacks", (req, res) => {
    const db = readDb();
    const category = String(req.query.category || "");
    const snacks = (db.snacks || []).filter(
      (snack: any) =>
        !category || category === "Todos" || snack.category === category
    );
    res.json(snacks);
  });

  app.get("/api/cart", (req, res) => {
    const db = readDb();
    const userId = String(req.query.userId || "");
    const cart = (db.carts || []).find(
      (item: any) => String(item.userId) === userId && item.status === "active"
    );
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    if (new Date(cart.expiresAt).getTime() <= Date.now()) {
      cart.status = "expired";
      writeDb(db);
      return res.status(410).json({ error: "El carrito ha expirado", cart });
    }
    return res.json(normalizeCart(cart));
  });

  app.post("/api/cart", (req, res) => {
    const { userId, userEmail, tickets = [] } = req.body || {};
    if (!userId || !Array.isArray(tickets) || tickets.length === 0) {
      return res
        .status(400)
        .json({ error: "El usuario y las entradas son obligatorios" });
    }
    const db = readDb();
    db.carts = (db.carts || []).filter(
      (cart: any) =>
        !(String(cart.userId) === String(userId) && cart.status === "active")
    );
    const cart = normalizeCart({
      id: Date.now(),
      userId,
      userEmail,
      tickets: tickets.map((ticket: any) => ({
        ...ticket,
        quantity: Math.max(1, Number(ticket.quantity) || 1),
      })),
      snacks: [],
      status: "active",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    });
    db.carts.push(cart);
    writeDb(db);
    return res.status(201).json(cart);
  });

  app.put("/api/cart", (req, res) => {
    const db = readDb();
    const cart = (db.carts || []).find(
      (item: any) =>
        String(item.userId) === String(req.body.userId) &&
        item.status === "active"
    );
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    if (req.body.tickets) cart.tickets = req.body.tickets;
    if (req.body.snacks) cart.snacks = req.body.snacks;
    Object.assign(cart, normalizeCart(cart));
    writeDb(db);
    return res.json(cart);
  });

  app.put("/api/cart/:id", (req, res) => {
    const db = readDb();
    const cart = (db.carts || []).find(
      (item: any) => String(item.id) === req.params.id
    );
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    if (req.body.tickets) cart.tickets = req.body.tickets;
    if (req.body.snacks) cart.snacks = req.body.snacks;
    const updated = normalizeCart(cart);
    Object.assign(cart, updated);
    writeDb(db);
    return res.json(updated);
  });

  app.post("/api/cart/apply-membership", (req, res) => {
    const db = readDb();
    const cart = (db.carts || []).find(
      (item: any) =>
        String(item.userId) === String(req.body.userId) &&
        item.status === "active"
    );
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    if (!req.body.code || req.body.code.toUpperCase() !== "RIWI15") {
      return res.status(400).json({ error: "Membresía no válida" });
    }
    cart.membershipCode = req.body.code.toUpperCase();
    Object.assign(cart, normalizeCart(cart));
    writeDb(db);
    return res.json(cart);
  });

  app.post("/api/cart/apply-giftcard", (req, res) => {
    const db = readDb();
    const cart = (db.carts || []).find(
      (item: any) =>
        String(item.userId) === String(req.body.userId) &&
        item.status === "active"
    );
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    if (!req.body.code || req.body.code.toUpperCase() !== "CINE25") {
      return res.status(400).json({ error: "Bono no válido" });
    }
    cart.giftcardCode = req.body.code.toUpperCase();
    cart.giftcardAmount = 25;
    Object.assign(cart, normalizeCart(cart));
    writeDb(db);
    return res.json(cart);
  });

  app.post("/api/cart/snacks", (req, res) => {
    const db = readDb();
    const cart = (db.carts || []).find(
      (item: any) =>
        String(item.userId) === String(req.body.userId) &&
        item.status === "active"
    );
    const snack = (db.snacks || []).find(
      (item: any) => String(item.id) === String(req.body.snackId)
    );
    const quantity = Number(req.body.quantity);
    if (!cart || !snack)
      return res
        .status(404)
        .json({ error: "Carrito o producto no encontrado" });
    if (snack.stock <= 0)
      return res.status(409).json({ error: "Producto agotado" });
    if (!Number.isInteger(quantity) || quantity < 1)
      return res.status(400).json({ error: "Cantidad no válida" });
    const existing = cart.snacks.find((item: any) => item.snackId === snack.id);
    if (existing)
      existing.quantity = Math.min(existing.quantity + quantity, snack.stock);
    else
      cart.snacks.push({
        snackId: snack.id,
        name: snack.name,
        unitPrice: snack.price,
        quantity: Math.min(quantity, snack.stock),
        image: snack.image,
      });
    Object.assign(cart, normalizeCart(cart));
    writeDb(db);
    return res.json(cart);
  });

  app.put("/api/cart/snacks/:snackId", (req, res) => {
    const db = readDb();
    const cart = (db.carts || []).find(
      (item: any) =>
        String(item.userId) === String(req.body.userId) &&
        item.status === "active"
    );
    const line = cart?.snacks.find(
      (item: any) => String(item.snackId) === req.params.snackId
    );
    const quantity = Number(req.body.quantity);
    if (!cart || !line)
      return res
        .status(404)
        .json({ error: "Producto no encontrado en el carrito" });
    if (!Number.isInteger(quantity) || quantity < 1)
      return res.status(400).json({ error: "Cantidad no válida" });
    const snack = db.snacks.find((item: any) => item.id === line.snackId);
    line.quantity = Math.min(quantity, snack?.stock || quantity);
    Object.assign(cart, normalizeCart(cart));
    writeDb(db);
    return res.json(cart);
  });

  app.delete("/api/cart/snacks/:snackId", (req, res) => {
    const db = readDb();
    const cart = (db.carts || []).find(
      (item: any) =>
        String(item.userId) === String(req.query.userId) &&
        item.status === "active"
    );
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    cart.snacks = cart.snacks.filter(
      (item: any) => String(item.snackId) !== req.params.snackId
    );
    Object.assign(cart, normalizeCart(cart));
    writeDb(db);
    return res.json(cart);
  });

  app.delete("/api/cart/:id", (req, res) => {
    const db = readDb();
    const cart = (db.carts || []).find(
      (item: any) => String(item.id) === req.params.id
    );
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    cart.status = "completed";
    cart.completedAt = new Date().toISOString();
    writeDb(db);
    return res.json({ success: true });
  });

  app.delete("/api/cart", (req, res) => {
    const db = readDb();
    const cart = (db.carts || []).find(
      (item: any) =>
        String(item.userId) === String(req.body?.userId || req.query.userId) &&
        item.status === "active"
    );
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    cart.status = "completed";
    cart.completedAt = new Date().toISOString();
    writeDb(db);
    return res.json({ success: true });
  });

  // API Routes (Mocking JSON-Server)
  app.get("/api/:resource", (req, res) => {
    const db = readDb();
    const resource = req.params.resource;
    if (db[resource]) {
      if (resource === "notifications" && req.query.userId !== undefined) {
        res.json(
          db[resource].filter(
            (i: any) => String(i.userId) === String(req.query.userId)
          )
        );
      } else {
        res.json(db[resource]);
      }
    } else {
      res.status(404).json({ error: "Resource not found" });
    }
  });

  app.get("/api/:resource/:id", (req, res) => {
    const db = readDb();
    const { resource, id } = req.params;
    if (db[resource]) {
      const item = db[resource].find((i: any) => i.id == id);
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ error: "Item not found" });
      }
    } else {
      res.status(404).json({ error: "Resource not found" });
    }
  });

  app.post("/api/:resource", (req, res) => {
    const db = readDb();
    const resource = req.params.resource;
    if (!db[resource]) {
      return res.status(404).json({ error: "Resource not found" });
    }

    try {
      // Validate unique email when creating users
      if (resource === "users" && req.body.email) {
        const exists = db.users.some((u: any) => u.email === req.body.email);
        if (exists) {
          return res.status(400).json({ error: "El correo ya existe" });
        }
      }

      const newItem = { id: Date.now(), ...req.body };

      // If resource is support, log the email dispatch to yunpapicodsito@gmail.com
      if (resource === "support") {
        console.log(
          `[SUPPORT EMAIL DISPATCH] To: yunpapicodsito@gmail.com | From: ${newItem.email} | Message: ${newItem.message}`
        );
        newItem.recipient = "yunpapicodsito@gmail.com";
        newItem.status = "Enviado con éxito a soporte";
      }

      // Notifications: schedule status by default
      if (resource === "notifications") {
        newItem.status = newItem.status || "Programada";
        newItem.createdAt = new Date().toISOString();
      }

      db[resource].push(newItem);
      writeDb(db);
      res.status(201).json(newItem);
    } catch (e) {
      res.status(500).json({ error: "No se pudo crear el usuario" });
    }
  });

  app.put("/api/:resource/:id", (req, res) => {
    const db = readDb();
    const { resource, id } = req.params;
    if (db[resource]) {
      const index = db[resource].findIndex((i: any) => i.id == id);
      if (index !== -1) {
        db[resource][index] = {
          ...db[resource][index],
          ...req.body,
          id: Number(id),
        };
        writeDb(db);
        res.json(db[resource][index]);
      } else {
        res.status(404).json({ error: "Item not found" });
      }
    } else {
      res.status(404).json({ error: "Resource not found" });
    }
  });

  app.delete("/api/:resource/:id", (req, res) => {
    const db = readDb();
    const { resource, id } = req.params;
    if (db[resource]) {
      db[resource] = db[resource].filter((i: any) => i.id != id);
      writeDb(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Resource not found" });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
