import dotenv from 'dotenv'
dotenv.config()

import { app } from './app'

const port = Number(process.env.PORT ?? 4010)

app.listen(port, () => {
  console.log(`Login service listening at http://localhost:${port}/api/v0`)
  console.log('API Testing UI: http://localhost:4010/api/v0/docs/')
})
