import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  categorySlug: text("category_slug").notNull(),
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  stock: integer("stock").notNull().default(0),
  images: text("images").array().notNull().default([]),
  sizes: text("sizes").array().notNull().default([]),
  colors: text("colors").array().notNull().default([]),
  badge: text("badge"),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sales: integer("sales").notNull().default(0),
  videoUrl: text("video_url"),
  deliveryDays: integer("delivery_days"),
  source: text("source").notNull().default("stock"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  name: text("name").notNull(),
  rating: integer("rating").notNull(),
  title: text("title"),
  body: text("body"),
  status: text("status").notNull().default("approved"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNo: text("order_no").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  city: text("city"),
  address: text("address"),
  payment: text("payment").notNull().default("cod"),
  notes: text("notes"),
  subtotal: integer("subtotal").notNull(),
  shippingFee: integer("shipping_fee").notNull().default(0),
  total: integer("total").notNull(),
  status: text("status").notNull().default("new"),
  assignedToStaffId: integer("assigned_to_staff_id"),
  assignedToName: text("assigned_to_name"),
  waNumber: text("wa_number"),
  claimedAt: timestamp("claimed_at"),
  releasedAt: timestamp("released_at"),
  releaseReason: text("release_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderHandoffs = pgTable("order_handoffs", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  orderNo: text("order_no").notNull(),
  fromName: text("from_name").notNull(),
  toStaffId: integer("to_staff_id"),
  toName: text("to_name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  whatsapp: text("whatsapp").notNull(),
  role: text("role").notNull().default("field"),
  onDuty: boolean("on_duty").notNull().default(false),
  dutyRequested: boolean("duty_requested").notNull().default(false),
  active: boolean("active").notNull().default(true),
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const outbox = pgTable("outbox", {
  id: serial("id").primaryKey(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  provider: text("provider").notNull().default("outbox"),
  sent: boolean("sent").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id"),
  productName: text("product_name").notNull(),
  options: text("options"),
  price: integer("price").notNull(),
  qty: integer("qty").notNull(),
  image: text("image"),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  city: text("city"),
  address: text("address"),
  sessionToken: text("session_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("supervisor"),
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  active: boolean("active").notNull().default(true),
  sessionToken: text("session_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type OutboxEmail = typeof outbox.$inferSelect;
