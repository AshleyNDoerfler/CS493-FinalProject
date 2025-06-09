status() {
    printf "\n=====================================================\n"
    printf "%s\n" "$1"
    printf -- "-----------------------------------------------------\n"
}

# curl -X POST http://localhost:8000/users \
#   -H "Content-Type: application/json" \
#   -d '{"name": "Admin", "email":"admin@example.com","password":"hello", "role": "admin"}'

# curl -X POST http://localhost:8000/users \
#   -H "Content-Type: application/json" \
#   -d '{"name": "Admin", "email":"admin@example.com","password":"hello", "role": "admin"}'

# curl -X POST http://localhost:8000/users/login \
#   -H "Content-Type: application/json" \
#   -d '{"email: "admin@example.com", "password": "hello", "role": "admin"}'


# Assignments Tests
#

status 'POST assignments succeeds'
curl -X POST http://localhost:8000/assignments \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "683df138a9b1f74a58046c20",
    "title": "Essay",
    "points": 10,
    "due": "Monday"
  }'

status 'GET assignments succeeds'
curl http://localhost:8000/assignments/6846842155f62dee509f0ce8

status 'POST assignments/{id}/submissions succeeds'
curl -X POST http://localhost:8000/assignments/6846842155f62dee509f0ce8/submissions \
  -F "file=@test.txt" \
  -F 'studentId=683df138a9b1f74a58046c20'

# status 'GET assignments/{id}/submissions succeeds'
curl http://localhost:8000/assignments/6846842155f62dee509f0ce8/submissions

status 'PATCH assignments suceeds'
curl -X PATCH http://localhost:8000/assignments/6846842155f62dee509f0ce8 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Huge important Essay",
    "points": 20,
    "due": "Sunday"
  }'

# status 'GET assignments/{id} succeeds after PATCH'
# curl http://localhost:8000/assignments/684672261cd5ea19f051e544

# status 'DELETE assignments succeeds'
curl -X DELETE http://localhost:8000/assignments/6846842155f62dee509f0ce8