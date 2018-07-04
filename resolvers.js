export default {
  Query: {
    user: async (parent, args, { User }) => {
      const user = await User.findById(args.id)
      user._id = user._id.toString()

      return user
    },
    userByEmail: async (parent, args, { User }) => {
      const user = await User.findOne({
        email: args.email
      })
      user._id = user._id.toString()

      return user
    },

    games: async (parent, args, { Game }) => {
      const games = await Game.find().sort({'name': 1}).populate('ratings.votes.user')
      return games
    },
    game: async (parent, args, { Game }) => {
      const game = await Game.findById(args.id).populate('ratings.votes.user')
      game._id = game._id.toString()

      return game
    },

    gameByVote: async (parent, args, { Game }) => {
      const game = await Game.findOne({
        'ratings.votes._id': args.id
      })
      game._id = game._id.toString()

      return game
    }
  },
  Mutation: {
    createUser: async (parent, args, { User }) => {
      const user = await new User(args.user).save()

      return user
    },
    createGame: async (parent, args, { Game }) => {
      const gameArgs = args

      gameArgs.ratings.forEach(rating => {
        rating.votes = [
          {
            user: '5b39a0f7ae6380e5d59b5b3b',
            value: rating.value
          }
        ]
      })

      const { _id } = await new Game(gameArgs).save()

      const game = await Game.findById(_id).populate('ratings.votes.user')
      return game
    },
    updateGame: async (parent, args, { Game }) => {
      const game = await Game.findByIdAndUpdate(args.id, args.game)
      game._id = game._id.toString()
      return game
    },
    addGameRating: async (parent, args, { Game }) => {
      const rating = {
        name: args.rating.name,
        votes: [
          {
            user: '5b39a0f7ae6380e5d59b5b3b',
            value: args.rating.value
          }
        ]
      }
      const game = await Game.findByIdAndUpdate(args.id, {
        $push: { ratings: rating }
      },
      {
        new: true
      }).populate('ratings.votes.user')
      game._id = game._id.toString()
      return game
    },
    addRatingVote: async (parent, args, { Game }) => {
      const game = await Game.findOneAndUpdate({
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
    removeRatingVote: async (parent, args, { Game }) => {
      const game = await Game.findById(args.gameId).populate('ratings.votes.user')

      game.ratings.id(args.ratingId).votes.id(args.voteId).remove()
      game.save()

      return game
    }
  }
}
