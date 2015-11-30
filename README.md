# Auth0 Logs to CSV

Small tool to export your Auth0 Logs to a CSV file.

![](https://cldup.com/ZNlm10-fKT.png)

> Note: this tool still uses API v1

## Getting your account information

 1. Go to the Auth0 dashboard
 2. Go to **Apps/APIs**
 3. Get the `domain`, `client_id` and `client_secret` for one of your apps
 4. Save this information in the config.json file

## Exporting your logs

 1. Install Node.js 4.0 or higher: https://nodejs.org/en/download/
 2. Clone/Download this repository
 3. Run `npm start` from the repository's directory

After a few seconds a CSV file will be available containing all of your logs. Use Excel to open the file, use the Text-to-Columns feature (with TAB as a delimiter) and convert everything to a table. This will allow you to filter data, hide columns, ...
