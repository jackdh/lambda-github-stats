"use strict";
require("dotenv").config();

const axios = require("axios");
const co = require("co");
const AWS = require("aws-sdk");
const { check_if_table_exists } = require("./create_table");
const table_name = "github-stats-information";

AWS.config.update({
  region: process.env.REGION
});

axios.defaults.headers.common["Authorization"] = `token ${
  process.env.GITHUB_APIKEY
}`;

// axios.defaults.baseURL = "https://api.github.com";

async function main(event, context, callback) {
  await co(function* t() {
    // const { data } = yield axios.get("https://api.github.com/repos/jackdh/RasaTalk/traffic/views");

    const dynamodb = new AWS.DynamoDB();
    yield check_if_table_exists(dynamodb, table_name);
    const { data } = yield axios.get("https://api.github.com/user/repos");

    for (let i = 0; i < data.length; i++) {
      const repo = data[i];

      const repo_info = yield axios.get(repo["url"]);

      const repo_views = yield axios.get(`${repo["url"]}/traffic/views`);

      for (let j = 0; j < repo_views.data.views.length; j++) {
        const view = repo_views.data.views[j];
        const today =
          new Date(view.timestamp).getDate() === new Date().getDate();

        if (today) {
          const params = {
            Item: {
              repository: {
                S: repo_info.data.name.toString()
              },
              date: {
                S: view.timestamp.toString()
              },
              forks: {
                S: repo_info.data.forks.toString()
              },
              open_issues: {
                S: repo_info.data.open_issues.toString()
              },
              stargazers_count: {
                S: repo_info.data.stargazers_count.toString()
              },
              subscribers_count: {
                S: repo_info.data.subscribers_count.toString()
              },
              watchers: {
                S: repo_info.data.watchers.toString()
              },
              views: {
                S: view.count.toString()
              },
              uniques: {
                S: view.uniques.toString()
              }
            },
            TableName: table_name
          };
          yield new Promise((res, rej) =>
            dynamodb.putItem(params, err => (err ? rej(err) : res()))
          );
        } else {
          const params = {
            TableName: table_name,
            ExpressionAttributeNames: {
              "#V": "views",
              "#U": "uniques"
            },
            ExpressionAttributeValues: {
              ":v": {
                N: view.count.toString()
              },
              ":u": {
                N: view.uniques.toString()
              }
            },
            Key: {
              repository: {
                S: repo_info.data.name
              },
              date: {
                S: view.timestamp
              }
            },
            UpdateExpression: "SET #V = :v, #U = :u"
          };

          yield new Promise((res, rej) =>
            dynamodb.updateItem(params, err => (err ? rej(err) : res()))
          );
        }
      }
    }
    console.log("Done");
    return true;
  })
    .then(() => {
      console.log("Success");
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Scraped!"
        })
      });
    })
    .catch(err => {
      console.log("Failed: ");
      console.log(err);
      callback(err);
    });
}

module.exports = {
  main
};
