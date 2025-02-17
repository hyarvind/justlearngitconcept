const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");

const express =require("express");
const app=express();
const path = require("path");
const methodoverride = require("method-override");

app.use(methodoverride("_method"));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views",path .join(__dirname, "views"));

const connection = mysql.createConnection({
    host: "localhost",  
    user: "root",
    database: "test",
    password: "Arvind@#",
});
faker.locale = 'en_IN';

let getRandomUser = () => {
    return [
        faker.string.uuid(), 
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};
let q = "INSERT INTO user (id, username, email, password) VALUES ?";

// Prepare an array to hold the generated users
let data = [];
for (let i = 1; i <= 100; i++) {
    data.push(getRandomUser()); // Generate 100 fake users
}

/// this is a home route
app.get("/", (req, res) => {
    let q= `select count (*) as count from user`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = result[0]["count (*)"];
                // res.send(result[0]["count (*)"]);
                res.render("home.ejs", {count :count});

    }) ;
 } catch (error) {
    console.log(err);
    res.send("some error in database");
    }
});
/// this is user route 
app.get("/user", (req, res) => {
   let q =` select * from user`;
    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
            res.render("showusers.ejs",{users});
        });
    } catch (error) {
        console.log(err);
        res.send("some error in database");
    }

});

////Edit router 
app.get("/edit/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;

    connection.query(q, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Some error in the database");
        }

        // Assuming result[0] contains the user data
        let user = result[0];
        res.render("edit.ejs", { user });
    });
});

/// UPDATE ROUTE
app.patch("/edit/:id", (req, res) => {
    let { id } = req.params;
    let { username: newusername , password : formpassword } = req.body;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    try{
    connection.query(q, (err, result) => {
        if (err) throw err; 
            let user = result[0];
            //// authentications 
            if (formpassword !== user.password) {
                return res.send("Password is incorrect");    
            }else {
                let q2 = `UPDATE user SET username = '${newusername}' WHERE id = '${id}'`;
                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    res.redirect("/user");
                    // res.send(result);
                });
            }
            res.send(user);
        });
     } catch (error) {
            console.log(err);
            res.send("some error in database");
     }
    });

/// listen 

app.listen("8080", () => {
    console.log("server is listining to 8080");
    
});

// Insert all users in the 'data' array into the MySQL database
// connection.query(q, [data], (err, result) => {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     console.log("Data inserted successfully:", result);
// });

// // Close the connection when done
// connection.end();
