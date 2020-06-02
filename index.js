const server = require("./server");

const port = process.env.PORT || 5000;

if (!module.parent) {
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  });
};