const co = require("co");

function check_if_table_exists(dynamodb, table) {
  return co(function* t() {
    const params = {
      TableName: table
    };
    const data = yield new Promise((res, rej) =>
      dynamodb.describeTable(params, (err, data) => {
        if (err) {
          console.log("Err");
          console.log(err);
          rej(err);
        } else {
          console.log("Data");
          console.log(data);
          res(data);
        }
      })
    );

    if (data && data.code === "ResourceNotFoundException") {
      yield create_table(dynamodb, table);
    }
    return true;
  });
}

function create_table(dynamodb, table) {
  return co(function* t() {
    const params = {
      AttributeDefinitions: [
        {
          AttributeName: "repository",
          AttributeType: "S"
        },
        {
          AttributeName: "date",
          AttributeType: "S"
        }
      ],
      KeySchema: [
        {
          AttributeName: "repository",
          KeyType: "HASH"
        },
        {
          AttributeName: "date",
          KeyType: "RANGE"
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      TableName: table
    };

    const data = yield new Promise((res, rej) =>
      dynamodb.createTable(params, (err, data) => (err ? rej(err) : res(data)))
    );

    return data;
  });
}

module.exports = {
  check_if_table_exists
};
