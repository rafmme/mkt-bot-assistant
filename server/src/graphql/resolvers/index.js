const resolvers = {
  Query: {
    root: () => 'Hello, World! My first graphql server',
    me: () => {
      return {
        username: 'Timileyin Farayola',
      };
    },
  },
};

export default resolvers;
