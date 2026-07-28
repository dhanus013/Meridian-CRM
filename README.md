# Meridian CRM

A lightweight CRM for managing companies and contacts — built as a hands-on AWS learning project. Plain HTML/Tailwind frontend, Node/Express API, and AWS RDS (MySQL) as the database.

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/AWS%20RDS-MySQL-4479A1?logo=mysql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-CDN-38B2AC?logo=tailwindcss&logoColor=white)



## Features

- Full CRUD for **companies** and **contacts**
- Contacts linked to companies, with live per-company contact counts
- Search across companies and contacts
- Filter contacts by company
- Clean, dependency-light frontend — no framework, no build step
- REST API backed by a connection pool to AWS RDS (MySQL)

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | HTML, Tailwind CSS (CDN), vanilla JS |
| Backend | Node.js, Express |
| Database | AWS RDS (MySQL), via `mysql2` |
| Hosting (optional) | EC2 (Ubuntu) + Nginx + PM2 |

## Project structure

```
meridian-crm/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── db.js               # mysql2 connection pool
│   ├── routes/
│   │   ├── companies.js
│   │   └── contacts.js
│   ├── sql/schema.sql       # RDS table definitions
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── index.html           # Companies page
    ├── contacts.html        # Contacts page
    ├── config.js            # API_URL
    ├── app.js               # shared fetch/toast/modal helpers
    ├── companies.js
    ├── contacts.js
    └── style.css
```

## Getting started

### 1. Create the RDS instance

AWS Console → RDS → **Create database** → MySQL → Free tier template. Note the master username/password and the instance **endpoint** once it's `Available`. Open inbound port `3306` on its security group for your IP.

### 2. Load the schema

```bash
mysql -h <your-rds-endpoint> -u <user> -p < backend/sql/schema.sql
```

### 3. Configure and run the backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
npm run dev
```

Check `http://localhost:5000/api/health` — should return `{"status":"ok","db":"connected"}`.

### 4. Run the frontend

```bash
cd frontend
npx serve -p 8080
```

Open `http://localhost:8080`.

## API reference

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check + DB connectivity |
| GET | `/api/companies?search=` | List companies (with contact counts) |
| GET | `/api/companies/:id` | One company + its contacts |
| POST | `/api/companies` | Create a company |
| PUT | `/api/companies/:id` | Update a company |
| DELETE | `/api/companies/:id` | Delete a company |
| GET | `/api/contacts?search=&company_id=` | List contacts (joined with company name) |
| GET | `/api/contacts/:id` | One contact |
| POST | `/api/contacts` | Create a contact |
| PUT | `/api/contacts/:id` | Update a contact |
| DELETE | `/api/contacts/:id` | Delete a contact |

## Deployment

Same pattern as a typical small Node app on AWS:

- **Backend**: EC2 (Ubuntu), run under **PM2**, ideally in the same VPC as RDS so you can disable RDS public access
- **Frontend**: served as static files by **Nginx**, which reverse-proxies `/api/` to the backend
- **Security groups**: EC2 allows inbound 80/443 from the internet; RDS allows inbound 3306 *only* from the EC2 security group, not `0.0.0.0/0`
- **Credentials**: for production, prefer an IAM role + Secrets Manager over a plaintext `.env` password

## Lessons learned

A few things that weren't obvious until they broke:

- An RDS **instance identifier** and the **database name** on that instance are two different things — naming your instance `my-db` doesn't create a database called `my-db`.
- `mysql2` connecting from Node on Windows can hit `ETIMEDOUT` over IPv6 even when a CLI client (`mysqlsh`) connects fine — forcing `family: 4` in the connection pool fixes it.
- `.env` is only read on process start. Editing it while the server is running does nothing until you restart — and a leftover process from an earlier terminal can keep answering on the same port, making a fix look like it "didn't work."

## License

MIT — free to use as a reference or starting point for your own AWS learning projects.
