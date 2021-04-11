import { User } from '../../db/models';

const resolvers = {
  Query: {
    root: () => 'Hello, World! My first graphql server',
    users: async (root, args, context) => {
      const users = await User.findAll();
      return users;
    },
  },
  Mutation: {
    async addUser(root, args, context) {
      const { facebookId, fullName, profilePic } = args;
      const user = await User.create({ facebookId, fullName, profilePic });

      if (!user) {
        return 'Unable to add user';
      }
      return 'User Added.';
    },
  },
};

export default resolvers;
