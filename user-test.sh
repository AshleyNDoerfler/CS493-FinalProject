#!/bin/bash

status() {
    printf "\n=====================================================\n"
    printf "%s\n" "$1"
    printf -- "-----------------------------------------------------\n"
}

USER_ID="6846744a30c2003157ee10da"
FAIL_ID="fail000"

# Create admin user
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin2", "email":"admin2@example.com","password":"hello2", "role": "admin"}'

# Create instructor user
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Instructor", "email":"instructor@example.com","password":"world", "role": "instructor"}'

# Create student user
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Student", "email":"student@example.com","password":"helloworld", "role": "student"}'

# Login user
curl -X POST http://localhost:8000/users/login \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@example.com",
        "password":"hello"
    }'

# Get a user by id
curl -X GET http://localhost:8000/users/$USER_ID \
    -H "Authorization: Bearer <TOKEN>"

# Get a user by id FAIL
curl -X GET http://localhost:8000/users/$FAIL_ID \
    -H "Authorization: Bearer FAKE_TOKEN"

