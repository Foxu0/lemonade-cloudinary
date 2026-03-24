## Lemonade Cloudinary Upload Server

This is a small Express backend that accepts image uploads from the Lemonade Shop frontend and forwards them to Cloudinary securely. The frontend never sees the Cloudinary API secret.

### 1. Configure environment

Create a `.env` file in this folder (do **not** commit it) and set:

```bash
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
PORT=4000
```

Use the Cloudinary credentials from your account. The `CLOUDINARY_URL` string is exactly the value shown in the Cloudinary dashboard (API Environment Variable).

### 2. Install and run

From the project root:

```bash
cd cloudinary-server
npm install
npm start
```

By default the server listens on `http://localhost:4000`.

### 3. API

#### `POST /upload?folder=products|profiles|gcash-proof|flavors|addons`

Multipart form-data:

- **file**: the image file to upload.
- **folder** (query string): optional; will be nested under `lemonade-shop/<folder>` in Cloudinary.

Response JSON:

```json
{
  "ok": true,
  "url": "https://res.cloudinary.com/...",
  "public_id": "lemonade-shop/products/..."
}
```

On error:

```json
{ "ok": false, "error": "message" }
```

### 4. Frontend configuration

In the frontend we use a single constant:

```js
const CLOUDINARY_BACKEND_URL =
  localStorage.getItem("cloudinaryBackendUrl") || "http://localhost:4000";
```

To point the app at a deployed server, open the browser console and run:

```js
localStorage.setItem("cloudinaryBackendUrl", "https://your-deployed-server.example.com");
```

The admin page, profile page (for future profile pictures) and checkout GCash proof upload will POST to `/upload` on this backend and then store only the returned Cloudinary URL in Firestore.

