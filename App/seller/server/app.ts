import express from 'express'
// TODO API endpoints

// import { PostTaskSchema } from '../shared/index.js'

// import * as health from './health/router.js'
// import { validate } from './middleware.js'
// import * as task from './task/router.js'


const app = express()
app.use(express.json())
/** API ENDPOINTS HERE **/
// app.get('/api/health', health.get)
// app.get('/api/task', task.get)
// app.post('/api/task', validate(PostTaskSchema), task.post)

export default app