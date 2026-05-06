import express from 'express'

// import { ListingSchema } from '../shared/index'
import * as listings from './listings/router'
// import { validate } from './middleware.js'


const app = express()
app.use(express.json())

/** API ENDPOINTS HERE **/
app.get('/api/listings', listings.get)
// app.post('/api/listings', validate(ListingSchema), listings.post)

export default app