import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: String,
  password: String
})
const User = mongoose.model('User', UserSchema)

const RatingSchema = new mongoose.Schema({
  name: String,
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    value: Number
  }]
})

RatingSchema.virtual('value').get(function () {
  let value = 0

  if (this.votes.length <= 0) {
    return value
  }

  value = this.votes.reduce((ac, next) => ac + next.value, value) / this.votes.length
  return value
})

const Rating = mongoose.model('Rating', RatingSchema)

const GameSchema = new mongoose.Schema({
  name: String,
  banner: String,
  ratings: [RatingSchema]
})
const Game = mongoose.model('Game', GameSchema)

export {
  Game,
  Rating,
  User
}