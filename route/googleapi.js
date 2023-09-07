const router = require("express").Router();
const { google } = require("googleapis");

router.post("/", async (req, res) => {

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets"
        })

        // Getting company name to which edit is to be made
        var compname = req.body.name;

        //Setting up API, authorizing client
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });

        // ID of spreadsheet on which edit is to be made
        const spreadsheetId = process.env.spreadsheet_id


        //Getting Values of Master Sheet to get total no of rows, and set serial no
        const sheetData = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: "Master Company Sheet"
        })

        //Getting total rows
        const numRows = sheetData.data.values.length;

        //Checking if company name already exists or not
        const companyExists = sheetData.data.values.some(row => row[1] === compname);

        if (companyExists) {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1; // Adding 1 to get the correct month number
            const currentYear = currentDate.getFullYear();

            compname += `_${currentMonth}/${currentYear}`;
        }

        //Adding Drive Name to Master Sheet
        await googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: "Master Company Sheet",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [
                    // Adding drive details to Master Company Sheet
                    [numRows, compname, req.body.profile, req.body.ctc, req.body.location, req.body.year]
                ]
            }
        })

        // Creating Individual Company/Drive Sheet
        await googleSheets.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: compname
                            }
                        }
                    }
                ]
            }
        })

        // Adding Header Details of Latest Drive Sheet like Name, Enrollment, Contact
        await googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: compname,
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [
                    ['S. No', "Name", "Enrollment No", "Contact", "Email", "Attendance"]
                ]
            }

        })

        //Sending response of successfully added
        res.status(201).send({ message: "Drive Added Successfully" })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" })
    }

})

module.exports = router;