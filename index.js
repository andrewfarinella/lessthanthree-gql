import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import mongoose from 'mongoose'
import morgan from 'morgan'
import jwt from 'express-jwt'
import jwks from 'jwks-rsa'
import config from './env.json'

import models from './lib/models'

import typeDefs from './schema'
import resolvers from './resolvers'
const myGraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers
})

mongoose.connect(config.mongodbServer + config.mongodbDatabase)

const PORT = process.env.PORT || 3000

const app = express()
app.set('jwtSecret', config.jwtSecret)

// Set up the CORS options for both development and prod
let whitelist

if (process.env.NODE_ENV === 'development') {
  whitelist = [
    'http://localhost:3000',
    'http://localhost:8080'
  ]
} else {
  whitelist = [
    'https://lessthanthree.games',
    'https://www.lessthanthree.games'
  ]
}

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

// Log out requests if in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Check to see if a call is an authorized call or not
const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://lessthanthreegames.auth0.com/.well-known/jwks.json'
  }),
  credentialsRequired: false,
  requestProperty: 'auth',
  audience: config.auth0Audience,
  issuer: 'https://lessthanthreegames.auth0.com/',
  algorithms: ['RS256']
})

app.use(jwtCheck)

// Add the user profile to the req object if they are authorized
app.use(async (req, _, next) => {
  if (req.auth) {
    const user = await models.User.findOne({
      sub: req.auth.sub
    })
    req.user = user
  } else if (req.get('X-GraphiQL-Query')) {
    req.user = true
  }
  next()
})

// bodyParser is needed just for POST.
app.use('/graphql', cors(corsOptions), bodyParser.json(), graphqlExpress((req) => {
  return {
    schema: myGraphQLSchema,
    context: req
  }
}))

// Only allow a graphiql endpoint if in development
if (process.env.NODE_ENV === 'development') {
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    passHeader: "'X-GraphiQL-Query': 'true'"
  }))
}

app.listen(PORT)
