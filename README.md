# Codeforces

This is an end-to-end clone of Codeforces. The primary motivation for building this project is to learn and understand remote code execution in a fast, secure, and reliable way.

The primary environment where the code runs is a micro VM started using Firecracker or E2B, which is a popular open-source tool used to start sandboxes for running code.

## Tech Stack

- Next.js for frontend
- Tailwind for CSS
- Express backend as primary backend
- Postgres as database
- (Optional) Redis as queue
- (Optional) Worker script using Firecracker or self-hosted E2B
- (Optional) Judge0 for code execution

## Options to Run the Code

1. **Using Firecracker to start a micro VM on a worker natively and execute code there**
   - Hard
   - Involves handling all the scenarios manually

2. **Using E2B's managed service or self-hosting to run the code in their sandbox/template**
   - Medium
   - Involves creation of sandboxes and taking them down

3. **Using Judge0's managed service or self-hosting to run the code in their environment**
   - Easiest
   - Just sending an API request (either to self-hosted Judge0 or their public API)
