#!/bin/bash


status() {
    printf "\n=====================================================\n"
    printf "%s\n" "$1"
    printf -- "-----------------------------------------------------\n"
}

# curl -X POST http://localhost:8000/users \
#   -H "Content-Type: application/json" \
#   -d '{"name": "Instructor", "email":"instructor@example.com","password":"hello", "role": "instructor"}'

# curl -X POST http://localhost:8000/users \
#   -H "Content-Type: application/json" \
#   -d '{"name": "Admin", "email":"admin@example.com","password":"hello", "role": "admin"}'

# curl -X POST http://localhost:8000/users/login \
#   -H "Content-Type: application/json" \
#   -d '{"email: "admin@example.com", "password": "hello", "role": "admin"}'


# Assignments Tests
#
# status 'Add new admin'
# curl -X POST http://localhost:8000/users/login
#   -H "Content-Type: application/json" \
#   -d '{
#     "courseId": "683df138a9b1f74a58046c20",
#     "email": "alice.johnson@example.com",
#     "password": "hashedpassword1"
#   }'

# status 'POST assignments succeeds'
# curl -X POST http://localhost:8000/assignments \
#   -H "Content-Type: application/json" \
#   -d '{
#     "courseId": "683df138a9b1f74a58046c20",
#     "title": "Essay",
#     "points": 10,
#     "due": "Monday"
#   }'

# status 'GET assignments succeeds'
# curl http://localhost:8000/assignments/684251fe2fdf55e3383aeca2

# status 'POST assignments/{id}/submissions succeeds'
# curl -X POST http://localhost:8000/assignments/684672261cd5ea19f051e544/submissions \
#   -F "file=@test.txt" \
#   -F 'studentId=683df138a9b1f74a58046c20'

# status 'GET assignments/{id}/submissions succeeds'
# curl http://localhost:8000/assignments/684672261cd5ea19f051e544/submissions

# status 'PATCH assignments suceeds'
# curl -X PATCH http://localhost:8000/assignments/684672261cd5ea19f051e544 \
#   -H "Content-Type: application/json" \
#   -d '{
#     "title": "Huge important Essay",
#     "points": 20,
#     "due": "Sunday"
#   }'

# status 'GET assignments/{id} succeeds after PATCH'
# curl http://localhost:8000/assignments/684672261cd5ea19f051e544

# status 'DELETE assignments succeeds'
# curl -X DELETE http://localhost:8000/assignments/684672261cd5ea19f051e544