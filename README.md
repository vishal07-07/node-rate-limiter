## Description

This project implements a rate-limited job queuing system using Express.js. Tasks are queued and processed sequentially, with completion logged to a file. The system enforces rate limits to ensure that no more than 1 task is processed per second and no more than 20 tasks per minute per user.

## Features

- Rate Limiting: Limits users to 1 request per second and 20 requests per minute.
- Task Queueing: Tasks are queued when rate limits are exceeded and processed sequentially.
- Logging: Task completions are logged to a file for record-keeping.


