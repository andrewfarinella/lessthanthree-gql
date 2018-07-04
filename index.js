import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

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

mongoose.connect('mongodb://localhost/lessthanthreegames')

const PORT = 3000

const app = express()
app.use(cors())

// bodyParser is needed just for POST.
app.post('/login', bodyParser.json(), function (req, res) {
  // const email = req.body.email
  const pass = req.body.password
  bcrypt.hash(pass, 10, (err, hash) => {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    }
    bcrypt.compare(pass, hash, (err, result) => {
      if (err) {
        console.log(err)
        res.sendStatus(500)
      }
      if (result) {
        res.sendStatus(200)
      } else {
        res.sendStatus(401)
      }
    })
  })
})
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: myGraphQLSchema, context: { Game, User } }))

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

app.listen(PORT)
