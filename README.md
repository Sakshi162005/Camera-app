# Camera Stream App

Node.js + React + PostgreSQL project with multi-user authentication, role-based authorization,
a camera tree, a live video wall, and an admin page for adding cameras by name and URL.

- **Backend** (`server/`): Express REST API, PostgreSQL via `pg`, JWT auth, bcrypt password hashing,
  admin user and camera management, and a WebSocket relay that pipes an FFmpeg MPEG-TS stream to browsers.
- **Frontend** (`client/`): React 18 + Vite, React Router, protected routes, sidebar camera tree,
  video wall with 1 / 2x2 / 3x3 / auto layouts, JSMpeg player, lucide icons.

```
Camera (RTSP / webcam / HTTP / test pattern)
        |
     FFmpeg  --mpeg1 / mpegts-->  Node (ws relay, JWT checked on upgrade)
                                         |
                            React video wall (JSMpeg <canvas> per tile)
```

## Quick start

Requirements: Node 18+, a running PostgreSQL server. FFmpeg is bundled (`ffmpeg-static`).

```bash
# 1. backend
cd server
copy .env.example .env        # Linux/macOS: cp .env.example .env
#    edit DATABASE_URL to point at your PostgreSQL (the database must exist, tables are auto-created)
npm install
npm run dev                   # http://localhost:4000

# 2. frontend (new terminal)
cd client
npm install
npm run dev                   # http://localhost:5173
```

Open http://localhost:5173 and sign in with the seeded admin account
(`ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env`, default `admin` / `Admin@123`).
On first start the server creates the tables, the admin user, and one **Demo test pattern** camera
so streaming can be verified without any hardware.

## Using the app

- **Left sidebar: camera tree.** Cameras are grouped by their *Group / location* path
  (`Building A/Floor 1` becomes nested folders). Click a camera to add it to or remove it from the wall.
  The green dot means FFmpeg is currently streaming that camera. Search filters the tree.
- **Right side: video wall.** Every selected camera streams live in its own tile. Choose a layout
  (auto, 1, 2x2, 3x3), open a tile full-size, or remove it. Your wall selection is remembered per user.
- **Cameras page (admin).** Add a camera with a name and a stream URL. The type is auto-detected from the
  URL (`rtsp://` -> RTSP, `http(s)://` -> HTTP/HLS/MJPEG, `video=...` -> Windows webcam, empty -> test pattern)
  or can be chosen explicitly. Set the group path and whether viewers may watch it. Edit or delete from the table.
- **Users page (admin).** Create users, change roles, reset passwords, delete users.

## Users and roles

| Role     | Can do                                                                                   |
|----------|------------------------------------------------------------------------------------------|
| `viewer` | Log in, see cameras whose access includes viewers, watch them on the wall                |
| `admin`  | Everything above, plus see every camera, add/edit/delete cameras, and manage users       |

- Self-registration (`/register`) always creates a `viewer`.
- An admin cannot demote or delete their own account.

## Stream sources

| Type           | Source example                                 | Notes                                                                       |
|----------------|------------------------------------------------|-----------------------------------------------------------------------------|
| `rtsp`         | `rtsp://user:pass@192.168.1.50:554/stream1`    | IP cameras, NVRs                                                            |
| `http`         | `http://host/mjpeg` or an `.m3u8`              | Any URL FFmpeg can read                                                     |
| `dshow`        | `video=Integrated Camera`                      | Windows webcam. List names: `ffmpeg -list_devices true -f dshow -i dummy`   |
| `v4l2`         | `/dev/video0`                                  | Linux webcam                                                                |
| `avfoundation` | `0`                                            | macOS webcam                                                                |
| `test`         | (empty)                                        | Synthetic pattern, no hardware needed                                       |

To use a system FFmpeg instead of the bundled one, set `FFMPEG_PATH` in `server/.env`.

## Database

PostgreSQL, configured by `DATABASE_URL` in `server/.env`. Tables are created automatically on startup
(`server/src/db.js`):

- `users` (id, username, password_hash, role, created_at)
- `cameras` (id, name, type, source, group_path, roles[], created_by, created_at, updated_at)

## API

| Method | Path                       | Auth           | Description                                        |
|--------|----------------------------|----------------|----------------------------------------------------|
| POST   | `/api/auth/register`       | public         | Create a viewer account, returns JWT               |
| POST   | `/api/auth/login`          | public         | Returns `{ user, token }`                          |
| GET    | `/api/auth/me`             | bearer         | Current user                                       |
| GET    | `/api/cameras`             | bearer         | Cameras visible to the caller's role + live status |
| GET    | `/api/cameras/:id`         | bearer         | Camera details + WebSocket path                    |
| POST   | `/api/cameras`             | admin          | Add `{ name, source, group?, type?, roles? }`      |
| PUT    | `/api/cameras/:id`         | admin          | Edit any of the fields above                       |
| DELETE | `/api/cameras/:id`         | admin          | Delete camera (stops its stream)                   |
| GET    | `/api/users`               | admin          | List users                                         |
| POST   | `/api/users`               | admin          | Create user `{ username, password, role }`         |
| PATCH  | `/api/users/:id`           | admin          | Change `role` and/or `password`                    |
| DELETE | `/api/users/:id`           | admin          | Delete user                                        |
| WS     | `/ws/stream/:id?token=JWT` | bearer (query) | MPEG-TS byte stream                                |

The WebSocket upgrade is rejected with 401/403 if the token is missing, invalid, or the role may not view
that camera. FFmpeg starts when the first viewer connects and stops when the last one disconnects.
A 10-second ping/pong heartbeat drops dead sockets.

## Project layout

```
server/
  src/index.js            Express app, runs migrations, seeds admin + demo camera
  src/config.js           env config
  src/db.js               PostgreSQL pool, migrations, users + cameras queries
  src/middleware/auth.js  signToken / authenticate / authorize(...roles)
  src/routes/auth.js      register, login, me
  src/routes/users.js     admin user management
  src/routes/cameras.js   camera list (role filtered) + admin CRUD
  src/stream/cameras.js   type detection, validation, seeding
  src/stream/streamer.js  FFmpeg process manager, fan-out, heartbeat
  src/stream/wsServer.js  WebSocket upgrade handler with JWT check
client/
  src/api/client.js               axios instance with JWT interceptor, streamUrl()
  src/context/AuthContext.jsx     session state
  src/context/CamerasContext.jsx  camera list polling + wall selection/layout
  src/components/AppShell.jsx     top bar + sidebar + content
  src/components/CameraTree.jsx   grouped, searchable tree
  src/components/VideoWall.jsx    tile grid and layout switcher
  src/components/StreamPlayer.jsx JSMpeg player
  src/pages/                      Login, Register, Wall, Camera (full view), ManageCameras, Users
```

## Production notes

- Set a strong `JWT_SECRET` and change the admin password.
- Serve the client build (`npm run build` in `client/`) behind the same origin as the API, or set `CLIENT_ORIGIN`.
- Use HTTPS so the JWT in the WebSocket query string is encrypted in transit.
