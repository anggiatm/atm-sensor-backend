const { default: axios } = require("axios");
const esp = require("../queries/esp-devices");

const isAlarmIncrease = (id, valAlarmNow, callback) => {
  let valAlarmBefore;

  esp.getByIdSingleParam(id, function (result) {
    valAlarmBefore = result[0];

    //rest of your code goes in here
  });

  console.log(valAlarmBefore);
  // const valAlarmBefore = await esp.getByIdSingleParam(id);
  if (valAlarmNow > valAlarmBefore[0].alarm_count) {
    return true;
  } else {
    return false;
  }
};

// const isAlarmIncrease = async (id, valAlarmNow) => {
//   let valAlarmBefore;

//   esp.getByIdSingleParam(id, function (result) {
//     valAlarmBefore = result[0];

//     //rest of your code goes in here
//   });

//   console.log(valAlarmBefore);
//   // const valAlarmBefore = await esp.getByIdSingleParam(id);
//   if (valAlarmNow > valAlarmBefore[0].alarm_count) {
//     return true;
//   } else {
//     return false;
//   }
// };

const sendWhatsappMessage = (recipient, message) => {
  const url =
    "https://api.callmebot.com/whatsapp.php?phone=" +
    recipient +
    "&text=" +
    message +
    "&apikey=8144895";
  axios
    .get(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
    })
    .then(({ data }) => {
      console.log(data);
    });
};

module.exports = {
  isAlarmIncrease,
  sendWhatsappMessage,
};
