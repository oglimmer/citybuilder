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

    "node": {
      Source: "node",
      Artifact: "startServer.js",
      configFile: {
        Name: "citybuilder.properties",
        Connections: [
          { Source:"couchdb", Var: "dbHost", Content: "http://$$VALUE$$:5984" },
          { Source:"couchdb", Var: "db", Content: "http://$$VALUE$$:5984/citybuilder" },
        ],
        Content: [
          "dbSchema=citybuilder",
          "httpPort=1337",
          "httpHost=0.0.0.0"
        ],
        AttachAsEnvVar: ["CITYBUILDER_PROPERTIES", "$$SELF_NAME$$"]
      }
    }

  }
}
