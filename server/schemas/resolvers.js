const { AuthenticationError } = require("apollo-server-express");
const User = require("../models/index");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await (await User.findOne({ id: context.user._id }))
          .select("-__v -password")
          .populate("Book");

        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
    user: async () => {
      return User.find().select("__v -password");
    },
    user: async (parent, { username }) => {
      return (await User.findOne({ username }))
        .select("-__v -password")
        .populate("Book");
    },
    Mutation: {
      addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);

        return { token, user };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });

        if (!user) {
          throw new AuthenticationError("Incorrect credentials");
        }

        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
          throw new AuthenticationError("Incorrect credentials");
        }

        const token = signToken(user);
        return { token, user };
      },

      saveBook: async (parent, { authors, description, title }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { friends: friendId } },
            { new: true }
          ).populate("friends");

          return updatedUser;
        }

        throw new AuthenticationError("You need to be logged in!");
      },
    },
  },
};
