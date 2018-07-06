import models from './lib/models'
import { Types } from 'mongoose'

const createRatings = async (ratings, userId) => {
  const ids = []
  for (const rating of ratings) {
    const newRating = await models.Rating.create({
      name: rating.name,
      votes: [
        {
          user: userId,
          value: rating.value
        }
      ]
    })

    ids.push(newRating._id)
  }
  return ids
}

export default {
  Query: {
    user: async (parent, args, req) => {
      const user = await models.User.findById(args.id)
      user._id = user._id.toString()

      return user
    },

    userByEmail: async (parent, args, req) => {
      const user = await models.User.findOne({
        email: args.email
      })
      user._id = user._id.toString()

      return user
    },

    games: async (parent, args, req) => {
      const games = await models.Game.find().sort({'name': 1})
      return games
    },

    game: async (parent, args, req) => {
      const game = await models.Game.findById(args.id)
      game._id = game._id.toString()

      return game
    },

    gameByVote: async (parent, args, req) => {
      const game = await models.Game.findOne({
        'ratings.votes._id': args.id
      })
      game._id = game._id.toString()

      return game
    },

    votesByUser: async (parent, args, req) => {
      const ratings = await models.Rating.find({
        'votes.user': Types.ObjectId(args.id)
      })

      const games = await models.Game.find({
        'ratings': { '$in': ratings.map(x => Types.ObjectId(x._id)) }
      })

      for (let i in games) {
        for (let j in games[i].ratings) {
          if (games[i].ratings[j].votes) {
            games[i].ratings[j].votes = games[i].ratings[j].votes.filter(vote => {
              console.log(vote.user._id.toString() === args.id)
              return vote.user._id.toString() === args.id
            })
            console.log(games[i].ratings[j].votes)
          }
        }
      }

      return games
    }
  },
  Mutation: {
    createUser: async (parent, args, req) => {
      const user = await new models.User(args.user).save()

      return user
    },
    createGame: async (parent, args, req) => {
      if (!req.user) return null
      const gameArgs = args

      gameArgs.ratings = await createRatings(gameArgs.ratings, req.user._id)

      console.log(gameArgs)

      const { _id } = await new models.Game(gameArgs).save()

      const game = await models.Game.findById(_id)
      return game
    },
    updateGame: async (parent, args, req) => {
      if (!req.user) return null
      const game = await models.Game.findByIdAndUpdate(args.id, args.game, { new: true })
      game._id = game._id.toString()
      return game
    },
    addGameRating: async (parent, args, req) => {
      if (!req.user) return null
      const ratingArgs = {
        name: args.rating.name,
        value: args.rating.value,
        votes: [
          {
            user: req.user._id,
            value: args.rating.value
          }
        ]
      }
      const rating = await models.Rating.create(ratingArgs)

      const game = await models.Game.findByIdAndUpdate(args.id, {
        $push: { ratings: rating._id }
      },
      {
        new: true
      })
      game._id = game._id.toString()
      return game
    },
    addRatingVote: async (parent, args, req) => {
      if (!req.user) return null
      const rating = await models.Rating.findByIdAndUpdate(args.ratingId, {
        $push: {
          votes: args.vote
        }
      }, {
        new: true
      })

      rating.value = rating.votes.reduce((ac, next) => ac + next.value, 0) / rating.votes.length
      await rating.save()

      const game = await models.Game.findOne({
        ratings: Types.ObjectId(rating._id)
      })

      console.log(game)

      game._id = game._id.toString()
      return game
    },
    removeRatingVote: async (parent, args, req) => {
      if (!req.user) return null

      const rating = await models.Rating.findByIdAndUpdate(args.ratingId, {
        $pull: {
          votes: {
            _id: args.voteId
          }
        }
      },
      {
        new: true
      })

      rating.value = rating.votes.reduce((ac, next) => ac + next.value, 0) / rating.votes.length
      await rating.save()

      const game = await models.Game.findOne({
        ratings: Types.ObjectId(args.ratingId)
      })

      game._id = game._id.toString()

      return game
    }
  }
}
