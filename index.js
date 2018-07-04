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
app.use(cors())

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: myGraphQLSchema, context: { Game, User } }))

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

app.listen(PORT)
