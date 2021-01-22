import { gql } from 'apollo-server-express';

const rootType = gql`
  type Query {
    root: String
    me: User
  }

  type User {
    username: String!
  }

  type Mutation {
    root: String
  }
`;

export default rootType;
