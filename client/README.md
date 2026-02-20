# Banking Client (React + Vite)

Yeh ek minimal React frontend hai jo aapke existing Node/Express backend se connect karega.

Quick start:

1. Client folder mein dependencies install karein:

```bash
cd client
npm install
```

2. Local dev server chalane ke liye:

```bash
npm run dev
```

3. Default API URL `http://localhost:3000` hai. Agar aapka backend alag port par hai toh `.env` mein `REACT_APP_API_URL` set karein.

Deploy suggestions:
- Frontend: Vercel ya Netlify (simple, automatic from Git)
- Backend: Render / Heroku / Railway (simple Node deployments)

Agar chaahein toh main ab aapke backend mein `CORS` enable karna aur frontend ko backend endpoints se connect karne ka step-by-step kar dunga.
