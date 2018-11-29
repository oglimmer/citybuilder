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
    pouchdb: {
      TestedWith: "1.7 & 2.0"
    },
    node: {
      TestedWith: "10 & 11 (slim&alpine)"
    }
  },

  software: {
    pouchdb: {
      Source: "couchdb",
      DockerImage: "oglimmer/pouchdb",
      DockerMemory: "50M"
    },

    node: {
      Source: "node",
      Start: "startServer.js",
      ExposedPort: 8080,
      DockerMemory: "50M",
      configFile: {
        Name: "citybuilder.properties",
        Content: [
          { Source:"pouchdb", Line: "dbHost=http://$$VALUE$$:5984" },
          { Source:"pouchdb", Line: "db=http://$$VALUE$$:5984/citybuilder" },
          { Line: "dbSchema=citybuilder" },
          { Line: "httpPort=8080" },
          { Line: "httpHost=0.0.0.0" }
        ],
        AttachAsEnvVar: ["CITYBUILDER_PROPERTIES", "$$SELF_NAME$$"]
      }
    }

  }
}
