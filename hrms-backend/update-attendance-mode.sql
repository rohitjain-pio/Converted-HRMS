-- Update employee 1 to use manual attendance mode
UPDATE employment_details 
SET is_manual_attendance = 1 
WHERE employee_id = 1;

-- Verify the update
SELECT employee_id, is_manual_attendance 
FROM employment_details 
WHERE employee_id = 1;
