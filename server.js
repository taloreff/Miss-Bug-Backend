import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import dotenv from 'dotenv'

import { loggerService } from './services/logger.service.js'
import { bugRoutes } from './api/bug/bug.routes.js'
import { userRoutes } from './api/user/user.routes.js'

dotenv.config()
const app = express()
//env var
app.use(express.static(path.resolve('public')))
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://localhost:5050',
        'https://127.0.0.1:5050',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://miss-bug-8b2w.onrender.com',
    ],
    credentials: true
}
app.use(cors(corsOptions))

app.use(cookieParser())
app.use(express.json())

app.use('/api/bug', bugRoutes)
app.use('/api/user', userRoutes)

app.get('/api/logs', async (req, res) => {
	res.sendFile(process.cwd() + '/logs/backend.log')
})

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3030
app.listen(port, () => loggerService.info(`Server listening on port http://127.0.0.1:${port}/`))