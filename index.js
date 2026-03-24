// Lightweight Express backend for handling Cloudinary uploads.
// IMPORTANT: Do NOT expose your Cloudinary API secret in frontend code.
// Configure credentials via environment variables before running:
//   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

if (!process.env.CLOUDINARY_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "CLOUDINARY_URL is not set. Set it in your environment before starting this server."
  );
} else {
  // Explicitly force Cloudinary to parse the environment variable.
  cloudinary.config(true);
  cloudinary.config({
    secure: true,
  });
}

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Allow the Lemonade frontend origin to call this server.
const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost",
  "http://localhost:80",
  "http://127.0.0.1",
  "http://127.0.0.1:80"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    }
  })
);

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Lemonade Cloudinary server is running." });
});

// Generic upload endpoint: POST /upload?folder=products|profiles|gcash-proof|flavors|addons
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "Missing file field 'file'." });
    }

    const folder = typeof req.query.folder === "string" && req.query.folder.trim()
      ? `lemonade-shop/${req.query.folder.trim()}`
      : "lemonade-shop/misc";

    const result = await cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image"
      },
      (error, uploadResult) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error("Cloudinary upload error", error);
          return res.status(500).json({ ok: false, error: "Upload failed." });
        }
        return res.json({
          ok: true,
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id
        });
      }
    );

    // Write the buffer into the upload stream
    result.end(req.file.buffer);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Upload handler error", e);
    res.status(500).json({ ok: false, error: "Unexpected error." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Lemonade Cloudinary server listening on port ${PORT}`);
});

