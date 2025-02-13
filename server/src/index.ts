import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dynamoose from "dynamoose";
import { clerkMiddleware, createClerkClient, requireAuth } from "@clerk/express";

/* ROUTE IMPORTS */
import courseRoutes from "./routes/courseRoutes";
import userClerkRoutes from "./routes/userClerkRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import userCourseProgressRoutes from "./routes/userCourseProgressRoutes";

/* CONFIGURATIONS */
dotenv.config({ path: ".env" }); // Явно вказуємо шлях до .env.local

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
    dynamoose.aws.ddb.local();
}

// Перевіряємо, чи завантажено CLERK_SECRET_KEY
if (!process.env.CLERK_SECRET_KEY) {
    console.error("CLERK_SECRET_KEY is missing. Please add it to your .env file.");
    process.exit(1); // Завершуємо процес, якщо ключ відсутній
}

// Ініціалізуємо Clerk Client
export const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
});

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(clerkMiddleware());

/* ROUTES */
app.get("/", (req, res) => {
    res.send("Hello");
});

app.use("/courses", courseRoutes);
app.use("/users/clerk", requireAuth(), userClerkRoutes);
app.use("/transactions", requireAuth(), transactionRoutes);
app.use("/users/course-progress", requireAuth(), userCourseProgressRoutes);

// Add support for favicon.ico requests
app.get("/favicon.ico", (req, res) => {
    res.status(204).send(); // Respond with no content
});

/* SERVER */
const port = process.env.PORT || 8001;

if (!isProduction) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
