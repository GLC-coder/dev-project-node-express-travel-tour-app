# Jason's Travel RESTful API

A travel endpoints RESTful APIs using Node.js, Express, and Mongoose.

## Available Scripts

## Installation

```bash
$ npm i

```

## Running the app

```bash

# development mode
$ npm run dev

# production mode

$ npm run start

# import original data

$  node ./dev-data/data/import-dev-data.js --import

# clear the original data from database

$ node ./dev-data/data/import-dev-data.js --clear

```

##Set the environment variables:

Add a file named `.env` at the root directory, and copy the environment name into the file and use the value from yourself.

NODE_ENV=
DATABASE_USERNAME=
DATABASE=
DATABASE_PASSWORD=
PASSWORD=
PORT=

JWT_SECRET=
JWT_EXPIRES_IN=
JWT_COOKIE_EXPIRES_IN=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USERNAME=
EMAIL_PASSWORD=

## Project Tech Stack

<table align="center" border=0>
   <tr>
      <td width="500"><b>Back-end</b></td>
   </tr>
   <tr>
      <td>
         • <b>Node Version</b>: >=10.0.0<br>
         • <b>Framework</b>: Express <br>
         • <b>Scripting Language</b>: JavaScript<br>  
         • <b>Database</b>: MongoDB<br>  
         • <b>Object Modelling Tool</b>: Mongoose<br>  
         • <b>Cloud database service</b>: MongoDB Atlas<br> 
      </td>
   </tr>
</table>

## Project Structure

```
root
|--.env
|--.eslintrc
|--.gitignore
|--.prettierrc
|--README
|--dev-data (original data)
   src\
   |--controllers\    # Route controllers (controller layer)
   |--middlewares\    # Custom and error middlewares
   |--models\         # Mongoose models (data layer) and business logic (service layer)
   |--routes\         # Routes
   |--utils\          # Utility classes and functions
   |--app.js          # Express app
   |--server.js       # App entry point
## API Documentation

To view the list of available APIs and their specifications: https://documenter.getpostman.com/view/20601052/VUxLvTXm

### API Endpoints

List of available routes:

**Auth routes**:\
`POST /api/v1/users/signup - sign up\
`POST /api/v1/users/signin` - signin\
`GET /api/v1/users/signout` - sign out\
`POST /api/v1/users/forgetpassword` - forget password\
`PATCH api/v1/users/resetpassword/:token` - reset password\
`PATCH /api/v1/users/updatepassword/` - update password\

**User routes**:\
`GET /api/v1/users` - get all users\
`GET /api/v1/users/:id` - get a user\
`GET /api/v1/users/me` - get me\
`PATCH /api/v1/users/update` - update user\
`PATCH /api/v1/users/updateme` - update me\
`DELETE /api/v1/users/:id` - delete a user\
`DELETE /api/v1/users/updateme` - delete me\
```

**Tour routes**:\
`GET /api/v1/tours` - get all tours\
`GET /api/v1/tours/:id` - get a tour\
`GET /api/v1/tours/top-5-cheap-tours` - get top 5 cheap tours\
`GET /api/v1/tours/get-tour-statistics` - get-tour-statistics\
`GET /api/v1/tours/get-monthly-tour-plan/year` - get-monthly-tour-plan by year\
`GET /api/v1/tours/tours-within/400/center/34.066486,-118.204371/unit/mi` - get tours with a point\
`GET /api/v1/tours/distances/34.066486,-118.204371/unit/km` - get distances to tours\
`PATCH /api/v1/tours/:id` - PATCH a tour\
`POST /api/v1/tours` - create a tour\
`DELETE /api/v1/tours/:id` - delete a tour\

```
**Review routes**:\
`GET /api/v1/reviews` - get all reviews\
`GET /api/v1/reviews/:id` - get a review\
`GET /api/v1/:tourId/reviews` - get all reviews for a tour\
`POST /api/v1/:tourId/reviews` - create a review for a tour\
`PATCH /api/v1/reviews/:id` - update a review\
`DELETE /api/v1/reviews/:id` - Delete a review\
```
