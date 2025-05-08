[![javascript](https://img.shields.io/badge/javascript-F7DF1E?style=flat\&logo=javascript\&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![html5](https://img.shields.io/badge/html5-E34F26?style=flat\&logo=html5\&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![css3](https://img.shields.io/badge/css3-1572B6?style=flat\&logo=css3\&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![node.js](https://img.shields.io/badge/node.js-8CC84B?style=flat\&logo=node.js\&logoColor=white)](https://nodejs.org/)
[![postgresql](https://img.shields.io/badge/postgresql-blue?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

# Edu Talk Web Application

**Edu Talk** is a school-oriented web application designed to enhance communication between students and teachers. It offers an improved forum-like experience with additional features to make interactions more engaging and personal.

## Features

* **User Authentication**: Secure registration and login via email or Google account.
* **Navigation**: Switch between app sections via a simple navigation panel.
* **Home**: View posts from all users; like and comment on them.
* **My Topics**: See only your own posts, with options to edit or delete.
* **New Topic**: Create a post by entering text and optionally uploading an image.
* **Profile**: View your personal info, log out, or delete your profile.

## Tech Stack

* **Frontend**: Vanilla JavaScript, HTML5, CSS3
* **Backend**: Node.js, Sequelize ORM
* **Database**: PostgreSQL (cloud-hosted)

## Prerequisites

* Node.js & npm
* PostgreSQL
* `.env` file (not included) with the following variables:

  ```
  PORT=your_port
  DATABASE_URL=your_database_url
  CLIENT_ID=your_client_id
  ```

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/profjuvii/edu-talk-app.git
   cd edu-talk-app
   ```
2. Install dependencies:

   ```bash
   cd server
   npm install
   ```
3. Create a `.env` file in the root directory with your `PORT` and `DATABASE_URL`.
4. Run the backend server:

   ```bash
   node server.js
   ```
5. Open `index.html` in your browser to launch the frontend.

> [!NOTE]
>
> This project is not deployed online and runs locally on `localhost`.

## Author

Created by [Denys Bondarchuk](https://github.com/profjuvii). Feel free to reach out or contribute to the project!