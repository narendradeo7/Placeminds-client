const router = require("express").Router();
const { google } = require("googleapis");

router.post("/", async (req, res) => {

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets"
        })

        // Getting company name to which edit is to be made
        // Body have two variables: 1. datadrive 2. userData sent from DriveCard.js when user clicks on apply now
        var compname = req.body.datadrive.name;

        //Setting up API, authorizing client
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });

        // ID of spreadsheet on which edit is to be made
        const spreadsheetId = process.env.spreadsheet_id

        //Getting Values of Company Sheet to get total no of rows, and set serial no
        const sheetData = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: compname
        })

        //Getting total rows
        const numRows = sheetData.data.values.length;

        // Adding user details to company sheet that applied for drive
        googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: compname,
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [
                    ["'" + numRows, req.body.userData.name, "'" + req.body.userData.enrollment, "'" + req.body.userData.contact, req.body.userData.email]
                ]
            }

        })

        //Sending response of successfully applied
        res.status(201).send({ message: "Applied Successfully" })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }

})

module.exports = router;