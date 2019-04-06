# About

* Node implementation to store Github stats overtime as opposed to the 14 day default limit from Github.
* Will also track each day the amount of stars, forks & subscribers so you can track the growth over time.

# Prerequisite

- Setup a DynamoDB table with the Primary key "date"
- [Have aws credentials setup locally](https://aws.amazon.com/cli/)
- Serverless framework installed `npm install -g serverless`

# Steps to setup

- Add your github API key
- Add your username / repo
- Add your table

# Steps to deploy

- `serverless deploy`

