
const moment = require('moment-jalaali')
const axios     = require('axios');
var request = require("request");
export const sendMessage = async (receptor,message)=>{
try{

    const  hashedpass = "Basic T21pZGtpc2g6VTFFN2NndiE2ekpB"
    const formData = {
        username: 'Omidkish',
        password: "U1E7cgv!6zJA"
    }
    request({
                    uri: `https://smsapi.asiatech.ir/connect/token`,
                    method: "POST",
                    contentType: 'x-www-form-urlencoded',
                    headers: {
                        'Authorization': hashedpass
                    },
                    formData :{
                    ...formData
                    } 
                },
                function(err, response, body) {
                    if(err){
                        return 
                    }
                        console.log(err)
                        console.log(body)
                        const res = JSON.parse(body)
                        if(res.access_token){
                           console.log(res.access_token)
                            const headers = {
                                'Authorization':  "Bearer "+res.access_token
                            }
                    
                           
                           
                          
                            const data = [{
                                    SourceAddress  : "9890000789",
                                    DestinationAddress :"98"+receptor,
                                    MessageText : message
                                }]
                                let options = {
                                    method: 'post',
                                    url: "https://smsapi.asiatech.ir/api/message/send",
                                    headers,
                                    data
                                }
                    
                                axios(options)
                                .then(result => {
                                   console.log(result)
                                })
                                .catch(err => {
                                    console.log(err)
                                })
                        }
                        
                        if(err)
                        console.log(err)
                }
            );

   
            return true;
    }catch(e){
        console.log(e)
        return false
    }
}

