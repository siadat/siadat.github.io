const args = process.argv.slice(2);
if(args.length == 0) {
  console.log(`Please provide sheet name as an argument`);
  return;
}
const sheetName = args[0];

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), listMajors);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});

  sheets.spreadsheets.get({
    spreadsheetId: '1HaLMhRIbREBv2XeIPEFK-rGMfTQMGSlUrD0LzhoJ7kk',
    fields: "sheets/data/rowData/values/formattedValue,sheets/data/rowData/values/note",
    // fields: "sheets/data/rowData/values", // everything
    ranges: [`${sheetName}!A:ZZZ`],
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    // console.log(JSON.stringify(res));
    let rows = res.data.sheets[0].data[0].rowData.map(rowData => rowData.values.map(colData => colData.note || colData.formattedValue));

    // copied:
    const headerRow = rows[0];
    const dataRows = rows.slice(1);
    const reformattedRows = dataRows.map((row, rowIdx) => {
      let item = {};
      for(let i = 0; i < row.length; i++) {
        let key = headerRow[i];
        if(!key || key.length == 0) {
          console.error(`key is empty, no header for row=${rowIdx} col=${i} where value is "${row[i]}"`);
          continue;
        }
        item[key] = row[i];
      }
      return item;
    });

    let j = JSON.stringify(reformattedRows);
    console.log(j);
  });

  return;

  sheets.spreadsheets.values.get({
    spreadsheetId: '1HaLMhRIbREBv2XeIPEFK-rGMfTQMGSlUrD0LzhoJ7kk',
    range: `${sheetName}!A:ZZZ`,
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;

    if(false) {
      let j = JSON.stringify(res.data, null, 2);
      console.log(j);
      return;
    }


    const headerRow = rows[0];
    const dataRows = rows.slice(1);
    const reformattedRows = dataRows.map((row, rowIdx) => {
      let item = {};
      for(let i = 0; i < row.length; i++) {
        let key = headerRow[i];
        if(!key || key.length == 0) {
          console.error(`key is empty, no header for row=${rowIdx} col=${i} where value is "${row[i]}"`);
          continue;
        }
        item[key] = row[i];
      }
      return item;
    });

    let j = JSON.stringify(reformattedRows);
    console.log(j);
  });
}
