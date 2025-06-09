#!/bin/bash

BASE_URL="http://localhost:8000/courses"

AUTH_HEADER=""

COURSE_ID="68467a3fcaada699ce8a2ec2"
INSTRUCTOR_ID="6846744a30c2003157ee10da"
STUDENT_ADD_ID="68467af4caada699ce8a2eca"
STUDENT_REMOVE_ID="665e963885b2b6c2fbb0d111"

echo "1. Create a Course"
curl -s -X POST "$BASE_URL" $AUTH_HEADER \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "CS",
    "number": "494",
    "title": "Cloud Application Development 2",
    "term": "Spring",
    "instructorId": "'"$INSTRUCTOR_ID"'"
  }' | jq
echo

echo "2. List Courses (paginated)"
curl -s -X GET "$BASE_URL?page=1" $AUTH_HEADER | jq
echo

echo "3. List Courses (filtered)"
curl -s -X GET "$BASE_URL?subject=CS&term=Spring" $AUTH_HEADER | jq
echo


echo "4. Get Course by ID"
curl -s -X GET "$BASE_URL/$COURSE_ID" $AUTH_HEADER | jq
echo

echo "5. Update a Course"
curl -s -X PATCH "$BASE_URL/$COURSE_ID" $AUTH_HEADER \
  -H "Content-Type: application/json" \
  -d '{"title": "Advanced Cloud Application Development"}'
echo


echo "7. Update Enrollment (add & remove students)"
curl -s -X POST "$BASE_URL/$COURSE_ID/students" $AUTH_HEADER \
  -H "Content-Type: application/json" \
  -d '{"add": ["'"$STUDENT_ADD_ID"'"], "remove": ["'"$STUDENT_REMOVE_ID"'"]}'
echo

echo "8. Get Students in Course"
curl -s -X GET "$BASE_URL/68467af4caada699ce8a2eca/students" $AUTH_HEADER | jq
echo

echo "9. Download Roster as CSV"
curl -s -X GET "$BASE_URL/$COURSE_ID/roster" $AUTH_HEADER
echo

echo "10. List Assignments for Course"
curl -s -X GET "$BASE_URL/$COURSE_ID/assignments" $AUTH_HEADER | jq
echo

# echo "6. Delete a Course"
# curl -s -X DELETE "$BASE_URL/$COURSE_ID" $AUTH_HEADER
# echo

echo "Done testing all /courses endpoints!"
