curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin", "email":"admin@example.com","password":"hello", "role": "admin"}'

curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin", "email":"admin@example.com","password":"hello", "role": "admin"}'

curl -X POST http://localhost:8000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email: "admin@example.com", "password": "hello", "role": "admin"}'