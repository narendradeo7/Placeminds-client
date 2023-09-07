const router = require("express").Router();
const { google } = require("googleapis");
const { User } = require("../models/userSchema")

router.post("/", async (req, res) => {

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets"
        })

        var enrollment = req.body.enrollment;
        var compname = req.body.compname;
        var OpentoAll = req.body.OpentoAll;
        
        //Setting up API, authorizing client
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });

        // ID of spreadsheet on which edit is to be made
        const spreadsheetId = process.env.spreadsheet_id

        //Getting Values of Company Sheet 
        const sheetData = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: compname
        })

        const headerRow = sheetData.data.values[0];
        const attendanceColumnIndex = headerRow.findIndex(header => header.toLowerCase() === 'attendance');


        const values = sheetData.data.values;
        const RowIndex = values.findIndex(row => row.includes(enrollment));

        if (RowIndex !== -1) {
            if (values[RowIndex][attendanceColumnIndex] === 'Present') {
                console.log("Already Present")
                res.status(423).send({ message: "Attendance Marked Successfully" })
            } else {
                values[RowIndex][attendanceColumnIndex] = 'Present'

                // Create a values update request
                const updateValuesRequest = {
                    values: [values[RowIndex]],
                };

                googleSheets.spreadsheets.values.update({
                    auth: auth,
                    spreadsheetId: spreadsheetId,
                    range: `${compname}!A${RowIndex + 1}:Z${RowIndex + 1}`, // Update the specific row
                    valueInputOption: 'RAW',
                    resource: updateValuesRequest,
                })
                console.log("Successful");
                res.status(201).send({ message: "Attendance Marked Successfully" })
            }
        }

        else {
            if (OpentoAll) {
                const user = await User.findOne({ enrollment: enrollment })
                const numRows = sheetData.data.values.length;

                googleSheets.spreadsheets.values.append({
                    auth,
                    spreadsheetId,
                    range: compname,
                    valueInputOption: "USER_ENTERED",
                    resource: {
                        values: [
                            ["'" + numRows, user.name, "'" + user.enrollment, "'" + user.contact, user.email, 'Present']
                        ]
                    }

                })

                console.log("Successfuly Added");
                res.status(201).send({ message: "User Added and Attendance Marked Successfully" })
            }
            else {
                console.log("Not Allowed");
                res.status(422).send({ message: "Not Applied for Drive" })
            }
        }

    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }

})

module.exports = router;