module.exports = {

  config: {
    FulgensVersion: '1.0.0',
    Name: "citybuilder",
    Vagrant: {
      Box: 'ubuntu/xenial64',
      BeforeInstall: [
        "curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -"
      ],
      Install: 'nodejs docker.io'
    }
  },

  software: {
    "couchdb": {
      Source: "couchdb"
    },

    "node": {
      Source: "node",
      Artifact: "startServer.js",
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
