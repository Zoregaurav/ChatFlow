# implementing Token Block:


Token verify? ------------>    Redis
              <------------ 
              Network call
# token usaage-> Ai ki baat kar raha hu..

problem:Implement this by your own....
10k token??

msg        ----------        
                       [   ]------- 6k
token:9000 -----------   |
                         |
                         15k
                          

# flow:
authenticatedUser-> check nahi karunga DB mein....
  |
Rate Limiter  --> check user rate limit
  |
loadUserDb --->
(new middleware)   load karunga 3 rd process mein db se user ko....