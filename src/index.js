const app = require("./config/app");
const server = require("./config/apollo");

const port = process.env.PORT;

server.applyMiddleware({ app });

app.listen({ port }, () => {
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
});
