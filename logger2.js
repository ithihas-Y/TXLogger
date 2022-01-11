import {ethers} from 'ethers'
import fetch from 'node-fetch'
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config()


const IERC = require("./IERC20.json");

const account = '0xd966A6Ea0B9930F9dB4e4c83198323739C441C40' // Replace this with account required to get history

//approve,transfer/burn,swaps(4-types of swaps)
let methods = ['0x095ea7b3','0xa9059cbb']

let swapMethods=['0x18cbafe5','0xb6f9de95','0x791ac947','0x8803dbee']

const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/')


const x =()=> fetch(`https://api.bscscan.com/api?module=account&action=txlist&address=${account}&startblock=0&endblock=999999999&apikey=${process.env.API_KEY}`).
then(x=>x.json().then(
    y=>{
        y.result.map(async i=>{

            if(i.isError ==1){
                console.log('transaction ' + i.hash + ' has failed' )
            }else {
                if(i.input == '0x'){
                    console.log('transferred '+ethers.utils.formatEther(i.value)+ 'from '+i.from+' to '+i.to)
                }
    
                if(i.input.substring(0,10) == methods[0]){
                    console.log(i.hash)
                    console.log('approved Address ' +'0x'+(ethers.utils.hexStripZeros('0x'+i.input.substring(10,74))) +
                    ' to Spend '+ethers.BigNumber.from('0x'+i.input.substring(74,74+64)).toBigInt())
                }
                
                if(i.input.substring(0,10) == methods[1]){
                    let tokens=parseInt(i.input.slice(10+64, 10+64+64),16);
                    const contract = new ethers.Contract(i.to,IERC,provider)
                    tokens= tokens/10**(await contract.decimals())
                    let tokensymbol=await contract.symbol()
    
                    console.log(i.hash,'\ntransfered',tokens,tokensymbol,'\tto=>',i.to,"\n")
                }
    
                if(i.contractAddress != ''){
                    console.log('New Contract created at '+i.contractAddress + ' with transactionID '+i.hash)
                }
                
    
                swapMethods.map(async(sm)=>{
                    if(sm==i.input.substring(0,10)){
                        let text=i.input;
                        let tokeninAddress='0x'+text.slice(text.length-64-64,text.length-64).slice(24);
                        let tokenoutAddress=text.slice(text.length-64).slice(24);
                        let tokensin =parseInt(text.slice(10, 10+64),16);
                        let tokensout=parseInt(text.slice(10+64, 10+64+64),16);
    
                        let tin,tout;
    
                        const contract1 = new ethers.Contract(tokeninAddress,IERC,provider)
                        tokensin= tokensin/10**(await contract1.decimals())
                        tin=await contract1.symbol()

                        const contract2 = new ethers.Contract(tokenoutAddress,IERC,provider)
                        tokensout= tokensout/10**(await contract2.decimals())
                        tout=await contract2.symbol()
                         
    
                        console.log(i.hash,'\nswapped\t',tokensin,tin,'\t for\t',tokensout,tout);
                    }
                })
            }
        })

    }
))

x()