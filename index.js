import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import mongoose from 'mongoose'
import config from './env.json'

import {
  Game,
  User
} from './lib/models'

import typeDefs from './schema'
import resolvers from './resolvers'
const myGraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers
})

mongoose.connect(config.mongodbServer + config.mongodbDatabase)

const PORT = 3000

const app = express()

const whitelist = [
  'http://localhost:3000',
  'http://localhost:8080',
  'https://lessthanthree.games',
  'https://www.lessthanthree.games'
]
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

// bodyParser is needed just for POST.
app.use('/graphql', cors(corsOptions), bodyParser.json(), graphqlExpress({ schema: myGraphQLSchema, context: { Game, User } }))

if (process.env.NODE_ENV === 'development') {
  app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))
}

app.listen(PORT)
