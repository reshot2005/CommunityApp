TRUNCATE TABLE
  messages,
  applications,
  jobs,
  posts,
  student_profiles,
  company_profiles,
  college_profiles,
  users
RESTART IDENTITY CASCADE;

INSERT INTO users (id, name, email, password_hash, role, created_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Aarav Sharma', 'aarav.sharma@example.com', '$2a$12$8Rw85l5HYEDsEi0J2dGuDO7UeBTGKTUkd4oFZaCa5A4rWV0NFzFoW', 'student', '2026-03-01 09:00:00'),
  ('10000000-0000-0000-0000-000000000002', 'Diya Patel', 'diya.patel@example.com', '$2a$12$8Rw85l5HYEDsEi0J2dGuDO7UeBTGKTUkd4oFZaCa5A4rWV0NFzFoW', 'student', '2026-03-01 09:05:00'),
  ('10000000-0000-0000-0000-000000000003', 'Ishaan Verma', 'ishaan.verma@example.com', '$2a$12$8Rw85l5HYEDsEi0J2dGuDO7UeBTGKTUkd4oFZaCa5A4rWV0NFzFoW', 'student', '2026-03-01 09:10:00'),
  ('10000000-0000-0000-0000-000000000004', 'Kavya Reddy', 'kavya.reddy@example.com', '$2a$12$8Rw85l5HYEDsEi0J2dGuDO7UeBTGKTUkd4oFZaCa5A4rWV0NFzFoW', 'student', '2026-03-01 09:15:00'),
  ('10000000-0000-0000-0000-000000000005', 'Neeraj Singh', 'neeraj.singh@example.com', '$2a$12$8Rw85l5HYEDsEi0J2dGuDO7UeBTGKTUkd4oFZaCa5A4rWV0NFzFoW', 'student', '2026-03-01 09:20:00'),
  ('20000000-0000-0000-0000-000000000001', 'NovaStack Labs', 'talent@novastacklabs.com', '$2a$12$8Rw85l5HYEDsEi0J2dGuDO7UeBTGKTUkd4oFZaCa5A4rWV0NFzFoW', 'company', '2026-03-01 10:00:00'),
  ('20000000-0000-0000-0000-000000000002', 'BlueOrbit Systems', 'careers@blueorbitsystems.com', '$2a$12$8Rw85l5HYEDsEi0J2dGuDO7UeBTGKTUkd4oFZaCa5A4rWV0NFzFoW', 'company', '2026-03-01 10:05:00'),
  ('20000000-0000-0000-0000-000000000003', 'GreenBridge AI', 'jobs@greenbridge.ai', '$2a$12$8Rw85l5HYEDsEi0J2dGuDO7UeBTGKTUkd4oFZaCa5A4rWV0NFzFoW', 'company', '2026-03-01 10:10:00'),
  ('30000000-0000-0000-0000-000000000001', 'South City College', 'placements@southcitycollege.edu', '$2a$12$8Rw85l5HYEDsEi0J2dGuDO7UeBTGKTUkd4oFZaCa5A4rWV0NFzFoW', 'college', '2026-03-01 11:00:00'),
  ('30000000-0000-0000-0000-000000000002', 'Lakeside Institute of Technology', 'careers@lakesideit.edu', '$2a$12$8Rw85l5HYEDsEi0J2dGuDO7UeBTGKTUkd4oFZaCa5A4rWV0NFzFoW', 'college', '2026-03-01 11:05:00');

INSERT INTO student_profiles (id, user_id, skills, resume_url, projects, created_at)
VALUES
  ('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], 'https://example.com/resumes/aarav-sharma.pdf', ARRAY['CampusConnect event platform', 'Realtime chat dashboard'], '2026-03-02 09:00:00'),
  ('11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', ARRAY['Python', 'Django', 'REST APIs', 'Docker'], 'https://example.com/resumes/diya-patel.pdf', ARRAY['Placement analytics portal', 'API performance monitor'], '2026-03-02 09:05:00'),
  ('11000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', ARRAY['Java', 'Spring Boot', 'AWS', 'MySQL'], 'https://example.com/resumes/ishaan-verma.pdf', ARRAY['Microservice order system', 'Cloud cost tracker'], '2026-03-02 09:10:00'),
  ('11000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', ARRAY['UI Design', 'Figma', 'HTML', 'CSS', 'JavaScript'], 'https://example.com/resumes/kavya-reddy.pdf', ARRAY['Student ambassador portal', 'Design system starter kit'], '2026-03-02 09:15:00'),
  ('11000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', ARRAY['Data Analysis', 'SQL', 'Power BI', 'Excel'], 'https://example.com/resumes/neeraj-singh.pdf', ARRAY['Hiring funnel dashboard', 'Placement trend reports'], '2026-03-02 09:20:00');

INSERT INTO company_profiles (id, user_id, company_name, description, created_at)
VALUES
  ('22000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'NovaStack Labs', 'NovaStack Labs builds developer tooling and internal productivity platforms for scaling startups.', '2026-03-02 10:00:00'),
  ('22000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'BlueOrbit Systems', 'BlueOrbit Systems delivers cloud infrastructure, enterprise dashboards, and data automation for modern teams.', '2026-03-02 10:05:00'),
  ('22000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'GreenBridge AI', 'GreenBridge AI creates applied machine learning products for hiring, education, and operations workflows.', '2026-03-02 10:10:00');

INSERT INTO college_profiles (id, user_id, college_name, location, created_at)
VALUES
  ('33000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'South City College', 'Hyderabad', '2026-03-02 11:00:00'),
  ('33000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Lakeside Institute of Technology', 'Bengaluru', '2026-03-02 11:05:00');

INSERT INTO jobs (id, company_id, title, description, location, salary, created_at)
VALUES
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Frontend Developer Intern', 'Work with the product team to ship responsive React features, improve accessibility, and support design system adoption.', 'Hyderabad', 350000, '2026-03-05 09:00:00'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Backend Node.js Developer', 'Build Express APIs, maintain PostgreSQL-backed services, and improve reliability for student and recruiter workflows.', 'Remote', 720000, '2026-03-05 09:30:00'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Product Designer', 'Design user journeys, create polished Figma prototypes, and partner with engineers to improve onboarding.', 'Bengaluru', 680000, '2026-03-05 10:00:00'),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'Data Analyst', 'Transform placement and recruiting data into dashboards, KPIs, and clear operational insights for stakeholders.', 'Pune', 600000, '2026-03-05 10:30:00'),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'Cloud Support Associate', 'Support deployment workflows, monitor cloud environments, and troubleshoot incidents across client systems.', 'Chennai', 540000, '2026-03-05 11:00:00'),
  ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 'Java Full Stack Engineer', 'Develop Spring Boot APIs and React interfaces for enterprise operations and self-service admin tools.', 'Remote', 900000, '2026-03-05 11:30:00'),
  ('40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000003', 'Machine Learning Intern', 'Prepare datasets, evaluate models, and help productionize AI features used in screening and recommendation flows.', 'Bengaluru', 500000, '2026-03-05 12:00:00'),
  ('40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', 'Prompt Engineer', 'Design evaluation prompts, improve LLM task reliability, and document repeatable QA workflows for applied AI.', 'Remote', 840000, '2026-03-05 12:30:00'),
  ('40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003', 'QA Automation Tester', 'Build API and UI regression suites, improve release confidence, and partner closely with product engineering.', 'Noida', 580000, '2026-03-05 13:00:00'),
  ('40000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', 'Campus Partnerships Coordinator', 'Coordinate campus drives, maintain college relationships, and support high-volume outreach programs.', 'Mumbai', 520000, '2026-03-05 13:30:00');

INSERT INTO applications (id, job_id, student_id, status, created_at)
VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'shortlisted', '2026-03-06 09:00:00'),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'reviewed', '2026-03-06 09:10:00'),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'applied', '2026-03-06 09:20:00'),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'accepted', '2026-03-06 09:30:00'),
  ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'reviewed', '2026-03-06 09:40:00'),
  ('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'applied', '2026-03-06 09:50:00'),
  ('50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002', 'rejected', '2026-03-06 10:00:00'),
  ('50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'shortlisted', '2026-03-06 10:10:00');

INSERT INTO posts (id, user_id, content, created_at)
VALUES
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'South City College is hosting a placement readiness bootcamp next Friday. Resume reviews and mock interviews are open for all final-year students.', '2026-03-07 09:00:00'),
  ('60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'NovaStack Labs has opened internship applications for frontend, backend, and design roles. We are especially looking for strong project work and clear communication.', '2026-03-07 10:00:00'),
  ('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Just finished deploying my placement analytics dashboard with Docker and Django. Happy to share what I learned about structuring APIs and dashboards.', '2026-03-07 11:00:00'),
  ('60000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'Lakeside Institute is inviting partner companies for an April campus hiring drive focused on software, data, and product roles.', '2026-03-07 12:00:00'),
  ('60000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'GreenBridge AI is running a virtual session on applied machine learning careers, model evaluation, and AI product workflows this weekend.', '2026-03-07 13:00:00');

INSERT INTO messages (id, sender_id, receiver_id, message, created_at)
VALUES
  ('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Hi Aarav, your frontend internship application looks strong. Can you share your availability for a short screening call this week?', '2026-03-08 09:00:00'),
  ('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Thanks for reaching out. I am available on Wednesday afternoon or Thursday morning.', '2026-03-08 09:10:00'),
  ('70000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'We would like to coordinate a campus hiring drive for analytics and cloud roles in the second week of April.', '2026-03-08 10:00:00'),
  ('70000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'That works for us. Please share expected student strength and preferred interview slots.', '2026-03-08 10:15:00'),
  ('70000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 'Hi Kavya, we reviewed your design portfolio and would like to invite you to the next round for our product designer opening.', '2026-03-08 11:00:00'),
  ('70000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'Thank you. I would be happy to take the next round. Please let me know the slot and format.', '2026-03-08 11:20:00');
