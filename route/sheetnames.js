const router = require("express").Router();
const { google } = require("googleapis");

router.post("/", async (req, res) => {

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets"
        })

        //Setting up API, authorizing client
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });

        // ID of spreadsheet on which edit is to be made
        const spreadsheetId = process.env.spreadsheet_id

        //Getting Values of Company Sheet to get total no of rows, and set serial no
        const sheetData = await googleSheets.spreadsheets.get({
            auth,
            spreadsheetId
        })

        const sheetTitles = sheetData.data.sheets.map(sheet => sheet.properties.title);
        res.json(sheetTitles);
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }

})

module.exports = router;