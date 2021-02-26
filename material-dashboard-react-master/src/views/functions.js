import axios from "axios";
var crypto = require("crypto");

export function cdRefresh() {
  window.location.reload();
}

export function cdCurrent() {
  return String.fromCharCode(169);
}

export function cdDefault() {
  return String.fromCharCode(9745);
}

export function validateSpecialCharacters(sss) {
    var sts = false;
    const TerroristCharacters = [];

    if (!sss.includes("\""))
    if (!sss.includes("\'"))
    if (!sss.includes("\`"))
    if (!sss.includes("\\"))
    if (!sss.includes("/"))
    if (!sss.includes("~"))
    if (!sss.includes("\%"))
    if (!sss.includes("^"))
    if (!sss.includes("\&"))
    if (!sss.includes("\+"))
      sts = true;
    return sts;
}

export function validateEmail(sss) {
    let sts = false;
    if (validateSpecialCharacters(sss)) {
      let xxx = sss.split("@");
      if (xxx.length === 2) {
        if (xxx[1].includes(".")) 
          sts = true;
      }
    }
    return sts;
}


export function hasGroup() {
  //console.log(`current gis is ${localStorage.getItem("gid")}`)
  var sts = false;
    if (localStorage.getItem("gid") !== null) 
    if (localStorage.getItem("gid") !== "") 
    if (localStorage.getItem("gid") !== "0")
      sts = true;
  return sts;
}

export function encrypt(text) {
  let hash="";
  try {
    const cipher = crypto.createCipheriv(process.env.REACT_APP_ALGORITHM, 
      process.env.REACT_APP_AKSHUSECRETKEY, 
      Buffer.from(process.env.REACT_APP_IV, 'hex'));
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    hash = encrypted.toString('hex');
  }
  catch (err) {
    console.log(err);
  } 
  return hash;
};

export function decrypt(hash) {
  const decipher = crypto.createDecipheriv(process.env.REACT_APP_ALGORITHM, 
    process.env.REACT_APP_AKSHUSECRETKEY, 
    Buffer.from(process.env.REACT_APP_IV, 'hex'));
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
  return decrpyted.toString();
};

const AMPM = [
  "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM", "AM",
  "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM", "PM"
];
  /**
 * @param {Date} d The date
 */
const TZ_IST={hours: 5, minutes: 30};
export function cricDate(d) {
  var xxx = new Date(d.getTime());
  xxx.setHours(xxx.getHours()+TZ_IST.hours);
  xxx.setMinutes(xxx.getMinutes()+TZ_IST.minutes);
  var myHour = xxx.getHours();
  var myampm = AMPM[myHour];
  if (myHour > 12) myHour -= 12;
  var tmp = `${MONTHNAME[xxx.getMonth()]} ${("0" + xxx.getDate()).slice(-2)} ${("0" + myHour).slice(-2)}:${("0" +  xxx.getMinutes()).slice(-2)}${myampm}`
  return tmp;
}

const notToConvert = ['XI', 'ARUN']
/**
 * @param {string} t The date
 */

export function cricTeamName(t) {
  var tmp = t.split(' ');
  for(i=0; i < tmp.length; ++i)  {
    var x = tmp[i].trim().toUpperCase();
    if (notToConvert.includes(x))
      tmp[i] = x;
    else
      tmp[i] = x.substr(0, 1) + x.substr(1, x.length - 1).toLowerCase();
  }
  return tmp.join(' ');
}

var prizeDetails = [];

async function getPrizeDetails() {
  // console.log("Checking length");
  if (prizeDetails.length > 0) return;
  try {
    console.log("reading proze details from database")
    let response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/prize/data`);
    prizeDetails = (await response.data);
  } catch(err)  {
    console.log("---------prize detail error");
    console.log(err);
  }
} 

export async function getPrizeTable(prizeCount, prizeAmount) {
  await getPrizeDetails();
  // console.log(prizeDetails);
  let myPrize = prizeDetails.find(x => x.prizeCount == prizeCount);
  // we will keep 5% of amount
  // rest (i.e. 95%) will be distributed among prize winners
  let totPrize = Math.floor(prizeAmount*1)
  let allotPrize = 0;
  let prizeTable=[]
  let i = 0;
  for(i=1; i<prizeCount; ++i) {
    let thisPrize = Math.floor(totPrize*myPrize["prize"+i.toString()]/100);
    prizeTable.push({rank: i, prize: thisPrize})
    allotPrize += thisPrize;
  }
  prizeTable.push({rank: prizeCount, prize: totPrize-allotPrize});
  return prizeTable;
}

export async function getUserBalance() {
  let myBalance = 0;
  try {
    let response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/wallet/balance/${localStorage.getItem("uid")}`);
    myBalance = (await response).data.balance;
  } catch(err) {
    myBalance = 0;
  }
  return myBalance;
}

export function specialSetPos() {
  //console.log(`in SSP: ${localStorage.getItem("joinGroupCode")}`)
  let retval = parseInt(process.env.REACT_APP_DASHBOARD);  //parseInt(process.env.REACT_APP_GROUP);
  if (localStorage.getItem("joinGroupCode").length > 0)
    retval = parseInt(process.env.REACT_APP_JOINGROUP);
  //console.log(`in SSP: ${retval}`)
  return retval;
}

// export function getImageName(imageName) {
//     let myName = imageName
//     // if (process.env.REACT_APP_HOMEPAGE.includes('localhost')) {
//     //   imageName = `public/${imageName}`;
//     // }
//     console.log(`In getimage: ${imageName}`);
//     try {
//       require(`${imageName}`);
//     } catch (err) {
//       myName = "NOIMAGE.JPG";
//     }
//     console.log(myName);
//     return imageName;
// }

export function getImageName(teamName) {
  let imageName = `${teamName}.JPG`;
  imageName = imageName.replaceAll(" ", "");
  // try {
  //   require(`${imageName}`);
  //   console.log(`file ${imageName} found`)
  // } catch (err) {
  //   console.log(`${imageName} not found`);
  // }
  return imageName;
}
