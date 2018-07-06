export default `
type User {
  _id: ID!
  sub: String!
  email: String!
  name: String
  first_name: String
  last_name: String
  picture: String
  role: String!
}

input UserInput {
  sub: String!
  email: String!
  first_name: String
  last_name: String
  role: String
}

type Vote {
  _id: ID!
  user: User!
  value: Int!
}

input VoteInput {
  user: ID!
  value: Int!
}

type Rating {
  _id: ID!
  name: String!
  value: Float!
  votes: [Vote]
}

input RatingInput {
  name: String!
  value: Int!
}

type Game {
  _id: ID!
  name: String!
  banner: String
  ratings: [Rating]!
}

input GameInput {
  name: String
  banner: String
}

type Query {
  user(id: ID!): User
  userByEmail(email: String!): User

  games: [Game!]!
  game(id: ID!): Game

  gameByVote(id: ID!): Game

  votesByUser(id: ID!): [Game]
}

type Mutation {
  createUser(user: UserInput!): User,
  createGame(name: String!, ratings: [RatingInput]): Game,
  updateGame(id: ID!, game: GameInput): Game,
  addGameRating(id: ID!, rating: RatingInput!): Game
  addRatingVote(ratingId: ID!, vote: VoteInput!): Game
  removeRatingVote(ratingId: ID!, voteId: ID!): Game
}
`
