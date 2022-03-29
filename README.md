# Web Application Development - Online Auction
This is the final project of the course Web Application Development in HCMUS. In this project, we build an online auction market using Tailwind for UI and Heroku as a host for server.

- See our web app at: https://horizon-online-auction.herokuapp.com/
- See detail requirements at: https://hackmd.io/@nndkhoa9/BJKMTpH5r.
- See source codes in directory `Source`.

### Tools

- IntelliJ/Visual Studio Code, MySQL Server, XAMPP
- ...

### Libraries

- Knex.js, Tailwind, handlebars, express, morgan, momentjs, passportjs, swal (SweetAlerts)
- ...

## Server side

- The server relies on Heroku
- Pictures are uploaded on Cloudinary 
- Database is deployed to ClearDB

## How to run this project
This project requires install [Node.js](https://nodejs.org/) and npm first

Install NodeJS through this link:
```sh
https://nodejs.org/en/download/
```

Install npm through the following command:

```sh
npm install -g npm
```

To see if you already have Node.js and npm installed and check the installed version, run the following commands:

```sh
node -v
npm -v
```

Then create a node project with:
```sh
npm init -y
```

After that, install all the libraries for this project:
```sh
npm install
```

Configure the information database and email so that it is appropriate for your program:
```sh
File: db.js
    host: '127.0.0.1',
    port: 3306, // Your port that you want to config
    user: 'root', // Your database admin name
    password: '', // Your database  password
    database: 'online-auction' // Your database name

File: email.js
const sender = nodemailer.createTransport({
    service: '', // Your mail service
    auth: {
        user: '', // Your email
        pass: '' // Your password
    }
});

File: seller.routes.js
cloudinary.config({
    cloud_name: "", // Your cloudinary name
    api_key: "",    // Your cloudinary API Key
    api_secret: ""  // Your cloudinary API Secret Key
});

```

Use this command to run the project:
```sh
npm start
```

## Authors
- [Thái Trần Hồng Phúc - 19KTPM - FIT HCMUS](https://github.com/phucthaii1820)
- [Hoàng Như Thanh - 19KTPM - FIT HCMUS](https://github.com/thanhhoang4869)
- [Ngô Huy Anh - 19HTTT - FIT HCMUS](https://github.com/tristanhuyanhngo)

