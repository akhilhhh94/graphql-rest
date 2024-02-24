import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { DataAPI } from "./api.mjs";
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';



import Keyv from "keyv";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";




interface ContextValue {
    dataSources: {
        DataAPI: DataAPI;
    };
  }
  
const books = [
    {
      title: 'The Awakening',
      author: 'Kate Chopin',
    },
    {
      title: 'City of Glass',
      author: 'Paul Auster',
    },
  ];
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }
  
  directive @cacheControl (
    maxAge: Int
    scope: CacheControlScope
  ) on FIELD_DEFINITION | OBJECT | INTERFACE
  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }
  type Data @cacheControl(maxAge: 10000000, scope: PUBLIC)  {
    id: Int
    title: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    data: [Data]
  }
`;

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
      books: () => books,
      data: async (_, { }, { dataSources }, info) => {
        //info.cacheControl.setCacheHint({ maxAge: 60000000, scope: 'PUBLIC' });
        //console.log(info.cacheControl);
        return dataSources.data.getData().then((res) => {
            return res.all_categories;
        })
      },
    },
  };

  // The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
    cache: new KeyvAdapter(new Keyv("redis://localhost:6379")), 
    plugins: [ApolloServerPluginCacheControl({ defaultMaxAge: 50000 })],
  });
  
  // Passing an ApolloServer instance to the `startStandaloneServer` function:
  //  1. creates an Express app
  //  2. installs your ApolloServer instance as middleware
  //  3. prepares your app to handle incoming requests
  const { url } = await startStandaloneServer(server, {
    context: async () => {
        const { cache } = server;
       return {
         // We create new instances of our data sources with each request,
         // passing in our server's cache.
         dataSources: {
            data: new DataAPI({ cache }),
         },
       };
     },
  });
  
  console.log(`🚀  Server ready at: ${url}`);