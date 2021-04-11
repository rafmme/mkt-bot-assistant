import { gql } from 'apollo-server-express';

const rootType = gql`
  type Query {
    root: String
    users: [User]
  }

  type User {
    id: Int
    facebookId: String!
    fullName: String
    profilePic: String
    createdAt: String
    updatedAt: String
  }

  type Mutation {
    addUser(facebookId: String!, fullName: String, profilePic: String): String
  }
`;

export default rootType;
