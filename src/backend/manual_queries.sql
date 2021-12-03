SELECT users.group_id AS group_id, samples.id AS sample_id FROM samples INNER JOIN users ON samples.uploaded_by_id = users.id GROUP BY group_id, sample_id;

# Get number of uploaded samples per group
SELECT groups.name AS name, count(subquery.sample_id) AS upload_count FROM (SELECT users.group_id AS group_id, samples.id AS sample_id FROM samples INNER JOIN users ON samples.uploaded_by_id = users.id GROUP BY group_id, sample_id) AS subquery INNER JOIN groups ON subquery.group_id = groups.id GROUP BY name;

# Get number of groups who have logged into Aspen at least once
SELECT groups.name AS group_name, count(users.id) FROM users INNER JOIN groups ON users.group_id = groups.id WHERE users.agreed_to_tos = 't' AND (users.system_admin = 'f') GROUP BY group_name;