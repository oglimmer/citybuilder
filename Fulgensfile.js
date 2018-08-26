module.exports = {

  config: {
    Name: "citybuilder",
    Vagrant: {
      Box: 'ubuntu/xenial64',
      Install: 'npm docker.io'
    }
  },

  software: {
    "couchdb": {
      Source: "couchdb"
    },

    "citybuilder": {
      Source: "node",
      Artifact: "startServer.js"
    }

  }
}
