/*
#######################################################################
#
# Copyright (C) 2022-2026 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
/*
#######################################################################
#                   DO NOT MODIFY THIS FILE
#######################################################################
*/

import { Pool } from 'pg'
import * as fs from 'fs'

import dotenv from 'dotenv'
dotenv.config({ path: './App/shopper/.env' })

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

const run = async (file: string) => {
  if (!fs.existsSync(file)) {
    return
  }

  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split(/\r?\n/)
  let statement = ''
  for (let line of lines) {
    line = line.trim()
    if (!line.startsWith('--')) {
      statement += ' ' + line + '\n'
      if (line.endsWith(';')) {
        await pool.query(statement)
        statement = ''
      }
    }
  }
}

const reset = async () => {
  await run('./App/sql/schema.sql')
  await run('./App/sql/data.sql')
}

const shutdown = async () => {
  await pool.end()
}

export { reset, shutdown }
