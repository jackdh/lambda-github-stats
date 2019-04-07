Serverless Application to track all of your Github Repository traffic stats for free.

# About

* Node implementation to store Github stats overtime as opposed to the 14 day default limit from Github.
* Will also track each day the amount of stars, clones, forks, subscribers & more so you can track the growth over time.
* Will automatically run once every 24 hours.
* All runs well within the AWS free tier.

# Prerequisite

- Rename `example.env` to `.env`
- Update .env with your information
- [Have aws credentials setup locally](https://aws.amazon.com/cli/)
- Serverless framework installed `npm install -g serverless`

# Steps to setup

- Add your github API key
- Add your username / repo
- Add your table

# Steps to deploy

- `serverless deploy`

