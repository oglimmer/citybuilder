module.exports = {

  config: {
    SchemaVersion: "1.0.0",
    Name: "citybuilder",
    Vagrant: {
      Box: "ubuntu/xenial64",
      Install: "nodejs docker.io"
    }
  },

  versions: {
    couchdb: {
      TestedWith: "1.7 & 2.0"
    },
    node: {
      TestedWith: "10 & 11 (slim&alpine)"
    }
  },

  software: {
    couchdb: {
      Source: "couchdb"
    },

    node: {
      Source: "node",
      Start: "startServer.js",
      ExposedPort: 8080,
      configFile: {
        Name: "citybuilder.properties",
        Connections: [
          { Source:"couchdb", Var: "dbHost", Content: "http://$$VALUE$$:5984" },
          { Source:"couchdb", Var: "db", Content: "http://$$VALUE$$:5984/citybuilder" },
        ],
        Content: [
          "dbSchema=citybuilder",
          "httpPort=8080",
          "httpHost=0.0.0.0"
        ],
        AttachAsEnvVar: ["CITYBUILDER_PROPERTIES", "$$SELF_NAME$$"]
      }
    }

  }
}
