# intercom-csv-import

CSV import tool for Intercom.io

Placeholder repo for possible future development.  I made this pretty quickly and it works really well, but it definitely needs some love and decoupling from my use case :-)

## Configuration

In `intercom-config.json`, include the following:
```json
{
  "APP_ID": "<your app id here>",
  "API_KEY": "<your api key here>"
}
```

## Usage

`node index.js my-import-file.csv`
