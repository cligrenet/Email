# Email

## About

### What is it?

Email is small project focusing on front-end for an email client that makes API calls to send and receive emails.

### Why I did this?

-   To practice vanilla Javascript DOM manipulation
-   Make API calls using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

#### API routes:

-   `GET /emails/<str:mailbox>`
-   `GET /emails/<int:email_id>`
-   `POST /emails`
-   `PUT /emails/<int:email_id>`

### Technically

This small project uses Django as backend framework, (Django integrated) SQLite as database and Django templates as client-side views.

## Prerequisites

-   [Python3](https://www.python.org/downloads/)
-   [Django](https://www.djangoproject.com/)
-   [Bootstrap4](https://getbootstrap.com/)

## To Start

-   Run `python3 manage.py runserver` inside the project root

## Port

```sh
http://127.0.0.1:8000/
```
## Demo Link
https://youtu.be/XZRgDbmlTfI
