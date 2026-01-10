# Codeforces 

This is an end to end copy of codeforces , primary motivation of building this project is to learn and understand 
remote code executaion in a fast , secure and reliable way . 
primary environment where the code might be running is a micro vm started using firecracker or e2b which is a popular open source tool used to start sandboxes for running code 



## Tech stack 
- next js for frontend
- tailwind for css 
- express backend as primary backend 
- postgres as database 
- (optional) redis as queue
- (optional) worker script using firecracker self hosting e2b 
- (optional) judge0 for code execution 

## options to run the code 

1. using firecracker to start microvm on a worker natively and execute code there (

- hard
- involves handling all the senarios manually

2. using e2b's  managed service or self hosting to run the code in their sandbox  / template
- mid 
- involves creation of sandboxes, taking them down . 


3. using judge0's managed service or self hosting to run the code in their environment 
- easiest 
- just sending an API request (either to self hosted judge0 or their public api)



