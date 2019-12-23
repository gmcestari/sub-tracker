import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    lastName: String!
    subscriptions: [Subscription]
  }

  type Subscription {
    id: Int!
    name: String!
    startDate: String!
    freeTrialDuration: Int
    frequency: String!
    autoRenew: Boolean!
    amount: Float!
    currency: Currency!
    owner: User!
  }

  type Currency {
    id: ID!
    code: String!
    name: String!
    subscriptions: [Subscription]
  }

  type Query {
    me: User
    allUsers: [User]
    userSubscriptions(userId: ID!): [Subscription]
    allCurrencies: [Currency]
  }

  type Mutation {
    register(
      email: String!
      password: String!
      name: String!
      lastName: String!
    ): Boolean!
    login(email: String!, password: String!): User
    invalidateTokens: Boolean!
    createSubscription(
      name: String!
      startDate: String!
      freeTrialDuration: Int
      frequency: String!
      autoRenew: Boolean!
      amount: Float!
      currencyId: ID!
      ownerId: ID!
    ): Subscription
    deleteSubscription(id: ID!): Boolean
    deleteUser(id: ID, email: String): String!
    deleteCurrency(id: ID, code: String): String!
    createCurrency(code: String!, name: String!): Currency
  }
`;
