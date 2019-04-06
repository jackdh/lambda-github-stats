"use strict";
const axios = require("axios");
const co = require("co");
const AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-2"
});

axios.defaults.headers.common["Authorization"] = "token YOUR API KEY";

const put_item = (docClient, params) =>
  new Promise(resolve => {
    console.log("Adding item");
    docClient.put(params, function(err, data) {
      if (err) {
        console.log("Failed");
        console.log(err);
      }
      resolve();
    });
  });

async function main(event, context, callback) {
  const { data } = await axios.get(
    "https://api.github.com/repos/jackdh/RasaTalk/traffic/views" // UPDATE TO YOUR PREFERENCE
  );

  const docClient = new AWS.DynamoDB.DocumentClient();
  for (let i = 0; i < data.views.length; i += 1) {
    const view = data.views[i];
    const params = {
      TableName: "github-stats",
      Item: {
        date: view.timestamp,
        views: view.count,
        uniques: view.uniques
      }
    };

    const today = new Date(view.timestamp).getDate() === new Date().getDate();

    if (today) {
      const repo = await axios.get(
        "https://api.github.com/repos/jackdh/RasaTalk" // UPDATE TO YOUR PREFERENCE
      );
      params["Item"]["forks"] = repo.data.forks;
      params["Item"]["open_issues"] = repo.data.open_issues;
      params["Item"]["stargazers_count"] = repo.data.stargazers_count;
      params["Item"]["subscribers_count"] = repo.data.subscribers_count;
      params["Item"]["watchers"] = repo.data.watchers;
    }
    await put_item(docClient, params);
  }

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      message: "Scraped!"
    })
  });
}

// main(null);
module.exports = {
  main
};
