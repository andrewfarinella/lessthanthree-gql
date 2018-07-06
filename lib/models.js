import mongoose from 'mongoose'
import autopouplate from 'mongoose-autopopulate'

const UserSchema = new mongoose.Schema({
  sub: String,
  email: String,
  first_name: String,
  last_name: String,
  picture: String,
  role: {
    type: String,
    default: 'user'
  }
})
UserSchema.virtual('name').get(function () {
  if (this.last_name && this.last_name !== '') {
    return this.first_name + ' ' + this.last_name
  } else {
    return this.first_name
  }
})
const User = mongoose.model('User', UserSchema)

const RatingSchema = new mongoose.Schema({
  name: String,
  value: Number,
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: true
    },
    value: Number
  }]
})
RatingSchema.plugin(autopouplate)

const Rating = mongoose.model('Rating', RatingSchema)

const GameSchema = new mongoose.Schema({
  name: String,
  banner: String,
  ratings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating',
    autopopulate: true
  }]
})
GameSchema.plugin(autopouplate)
const Game = mongoose.model('Game', GameSchema)

export default {
  Game,
  Rating,
  User
}
