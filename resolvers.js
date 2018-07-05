import models from './lib/models'

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
      console.log(req.user)
      const games = await models.Game.find().sort({'name': 1}).populate('ratings.votes.user')
      return games
    },
    game: async (parent, args, req) => {
      const game = await models.Game.findById(args.id).populate('ratings.votes.user')
      game._id = game._id.toString()

      return game
    },

    gameByVote: async (parent, args, req) => {
      const game = await models.Game.findOne({
        'ratings.votes._id': args.id
      })
      game._id = game._id.toString()

      return game
    }
  },
  Mutation: {
    createUser: async (parent, args, req) => {
      if (!req.user) return null
      const user = await new models.User(args.user).save()

      return user
    },
    createGame: async (parent, args, req) => {
      if (!req.user) return null
      const gameArgs = args

      gameArgs.ratings.forEach(rating => {
        rating.votes = [
          {
            user: req.user._id,
            value: rating.value
          }
        ]
      })

      const { _id } = await new models.Game(gameArgs).save()

      const game = await models.Game.findById(_id).populate('ratings.votes.user')
      return game
    },
    updateGame: async (parent, args, req) => {
      if (!req.user) return null
      const game = await models.Game.findByIdAndUpdate(args.id, args.game)
      game._id = game._id.toString()
      return game
    },
    addGameRating: async (parent, args, req) => {
      if (!req.user) return null
      const rating = {
        name: args.rating.name,
        votes: [
          {
            user: req.user._id,
            value: args.rating.value
          }
        ]
      }
      const game = await models.Game.findByIdAndUpdate(args.id, {
        $push: { ratings: rating }
      },
      {
        new: true
      }).populate('ratings.votes.user')
      game._id = game._id.toString()
      return game
    },
    addRatingVote: async (parent, args, req) => {
      if (!req.user) return null
      const game = await models.Game.findOneAndUpdate({
        '_id': args.gameId,
        'ratings._id': args.ratingId
      }, {
        $push: {
          'ratings.$.votes': args.vote
        }
      }, {
        new: true
      }).populate('ratings.votes.user')

      game._id = game._id.toString()
      return game
    },
    removeRatingVote: async (parent, args, req) => {
      if (!req.user) return null
      const game = await models.Game.findById(args.gameId).populate('ratings.votes.user')

      game.ratings.id(args.ratingId).votes.id(args.voteId).remove()
      game.save()

      return game
    }
  }
}
