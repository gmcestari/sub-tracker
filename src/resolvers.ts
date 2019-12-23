import * as bcrypt from 'bcryptjs';
import { IResolvers } from 'graphql-tools';
import { createTokens } from './auth';
import { Currency } from './entity/Currency';
import { Subscription } from './entity/Subscription';
import { User } from './entity/User';

export const resolvers: IResolvers = {
  Query: {
    me: (_, __, { req }) => {
      if (!req.userId) {
        return null;
      }

      return User.findOne(req.userId);
    },
    allUsers: async (_parent, _args) => {
      return await User.find({
        order: {
          id: 'ASC',
        },
      });
    },
    userSubscriptions: async (_parent, { userId }) => {
      return await Subscription.find({
        where: {
          owner: userId,
        },
        relations: ['currency', 'owner'],
      });
    },
    allCurrencies: async (_parent, _args) => {
      return await Currency.find({
        order: {
          id: 'ASC',
        },
      });
    },
  },
  Mutation: {
    register: async (_, { email, password, name, lastName }) => {
      const foundUser = await User.findOne({ where: { email } });

      if (foundUser) {
        throw new Error('User already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        email,
        password: hashedPassword,
        name,
        lastName,
      }).save();

      return true;
    },
    deleteUser: async (_, { id, email }) => {
      if (!id && !email) {
        throw new Error('Either an ID or a email is needed to delete a user.');
      }

      const foundUser = await User.findOne({ where: [{ id }, { email }] });

      if (!foundUser) {
        throw new Error('User not found.');
      }

      const deleteResult = await User.delete(foundUser);

      if (deleteResult.affected === 0) {
        return 'Delete operation was not successful';
      }

      return `${deleteResult.affected} User(s) successfully deleted.`;
    },
    login: async (_, { email, password }, { res }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return null;
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return null;
      }

      const { accessToken, refreshToken } = createTokens(user);

      res.cookie('refresh-token', refreshToken);
      res.cookie('access-token', accessToken);

      return user;
    },
    invalidateTokens: async (_, __, { req }) => {
      if (!req.userId) {
        return false;
      }

      const user = await User.findOne(req.userId);
      if (!user) {
        return false;
      }

      user.count += 1;
      await user.save();

      return true;
    },
    createSubscription: async (
      _,
      {
        name,
        startDate,
        freeTrialDuration,
        frequency,
        autoRenew,
        amount,
        currencyId,
        ownerId,
      }
    ) => {
      const user = await User.findOne({ where: { id: ownerId } });

      if (!user) {
        throw new Error('User does not exist');
      }

      const foundSubscription = await Subscription.findOne({ where: { name } });

      if (foundSubscription) throw new Error('Subscription already exists');

      await Subscription.create({
        name,
        startDate,
        freeTrialDuration,
        frequency,
        autoRenew,
        amount,
        currency: currencyId,
        owner: ownerId,
      }).save();

      const savedSubscription = await Subscription.findOne({ where: { name } });

      return savedSubscription;
    },
    deleteSubscription: async (_, { id }) => {
      if (!id) {
        throw new Error('An ID is needed to delete a subscription.');
      }

      const foundSubscription = await Subscription.findOne({ where: { id } });

      if (!foundSubscription) {
        throw new Error('User not found.');
      }

      const deleteResult = await Subscription.delete(foundSubscription);

      if (deleteResult.affected === 0) {
        return 'Delete operation was not successful';
      }

      return `${deleteResult.affected} Subscription(s) successfully deleted.`;
    },
    createCurrency: async (_, { code, name }) => {
      const foundCurrency = await Currency.findOne({ where: { code } });

      if (foundCurrency) {
        throw new Error('Currency already exists');
      }

      await Currency.create({
        code,
        name,
      }).save();

      const savedCurrency = await Currency.findOne({ where: { code } });

      return savedCurrency;
    },
    deleteCurrency: async (_, { id, code }) => {
      if (!id && !code) {
        throw new Error(
          'Either an ID or a code is needed to perform a delete.'
        );
      }

      const foundCurrency = await Currency.findOne({
        where: [{ id }, { code }],
      });

      if (!foundCurrency) {
        throw new Error('Currency not found.');
      }

      const deleteResult = await Currency.delete(foundCurrency);

      if (deleteResult.affected === 0) {
        return 'Delete operation was not successful';
      }

      return `${deleteResult.affected} Currency successfully deleted.`;
    },
  },
};
