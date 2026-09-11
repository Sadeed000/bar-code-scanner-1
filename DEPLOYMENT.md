The default setup serves the frontend, API, and uploads from one domain.

Local development:

1. Start the backend with `npm --prefix backend run dev` (port 9797, or `PORT` from `backend/.env`).
2. Start the frontend with `npm --prefix frontendd run dev` (port 5173).
3. Vite forwards `/api` and `/uploads` to `http://localhost:9797`.

Server deployment:

1. Keep `VITE_API_BASE_URL=/api` in `frontendd/.env`. Run `npm --prefix frontendd run build` on each deployment.
2. Set `MONGO_URI`, `JWT_SECRET`, and `PORT` in `backend/.env` or the server environment.
3. Set `SERVER_URL` and `CLIENT_URL` to the public HTTPS site origin, without a trailing slash, for generated QR links and redirects.
4. Set `FRONTEND_DIST` to the absolute path of the new frontend build. Without this setting, the backend checks `backend/dist`, then `backend/src/dist`, then `frontendd/dist`, selecting the first containing `index.html`.
5. Keep `UPLOAD_DIR` on persistent storage. Its default is `backend/uploads`; relative values resolve from `backend`. Preserve existing files when deploying. If changing the directory, copy existing uploads into it first with the same folder structure.
6. Run `npm --prefix backend start` (or `node backend/app.js`; both start the same server).
7. Point the public domain's reverse proxy at the backend port, including `/api`, `/uploads`, and all frontend paths. Set its upload limit to accommodate multipart image requests (up to 10 MB per brand image).

For a frontend hosted separately, route `/api` and `/uploads` to the backend, or set `VITE_API_BASE_URL=https://your-api-domain/api` and rebuild. Image paths follow that API host. Use HTTPS for both services.

Checks:

```sh
node --test frontendd/src/api/urls.test.js
node --test backend/tests/deployment.test.cjs
npm --prefix frontendd run build
```

The deployment test uploads temporary image fixtures and checks that the server returns their bytes. It does not connect to MongoDB or modify existing brands.

If icon uploads return `404 Cannot POST /api/brands/icon`:

- The running backend does not expose the route at that URL. The frontend already calls the correct endpoint; changing its API URL is not the fix.
- Deploy the current backend files, including `src/routes/brand.routes.js`, `src/app.js`, `app.js`, and `config/uploads.js`, with the rest of their dependencies. Updating only the frontend build does not install backend routes.
- Configure the backend startup file as `src/app.js` relative to `backend`, or use `npm start` from that directory. Restart the actual backend process using the hosting provider's process manager.
- Ensure `/api/brands/icon` reaches that same backend, without a proxy rule forwarding it to a different service or removing `/api`.
- Verify without uploading a file or sending credentials:

```sh
curl -i -X POST https://demo.sparrownix.com/api/brands/icon
```

The expected response is `401` with JSON `{"message":"Unauthorized"}`. A `404` means the deployed route is still absent or misrouted. Then sign in and upload a PNG/JPG/WebP/GIF under 5 MB; the authenticated request should return `200` with an `/uploads/icons/...` URL.
