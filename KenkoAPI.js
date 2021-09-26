var CHANNEL_ACCESS_TOKEN = 'CHANNEL_ACCESS_TOKEN';
var line_endpoint = 'https://api.line.me/v2/bot/message/reply';

function doGet() {
  return ContentService.createTextOutput('ahhhhhhhhhhhhhhh!!!!');
}

function doPost(e) {
  var json = JSON.parse(e.postData.getDataAsString());

  /** 受信したメッセージ情報を変数に格納する */
  var validate;
  try {
    // var timestamp = json["timestamp"];
    // var timestamp = 1632607943;
    // var measured_salt = 42;
    // var measured_suger = 57;
    var timestamp = getUnixTime();
    var measured_salt = json["salt"];
    var measured_suger = json["suger"];
    validate = true;
  } catch (e) {
    validate = false;
  }

  var result;
  if (validate) {
    try {
      saveDataToSpreadSheet(timestamp, measured_salt, measured_suger); // DBに計測値を保存
      message_content_reporting = getReportingMessageContent(measured_salt, measured_suger);
      took_amounts = getTookAmount(measured_salt, measured_suger);
      took_salt = took_amounts[0];
      took_suger = took_amounts[1];
      message_content_calculating = getCalculatedMessageContent(took_salt, took_suger);
      // message_contents = message_content_reporting + "\n\n" + message_content_calculating;
      /** LINEのuser_idを取得してプッシュ通知 */
      var user_id = "line_user_id";
      sendPushLine(user_id, message_content_reporting);
      sendPushLine(user_id, message_content_calculating);

    } catch(e) {
      // 例外エラー処理 
      Logger.log('Error:')
      Logger.log(e)
      var result = e;
      return result;
    }

  } else {
    message_content = '申し訳ございません、エラーです。';

    var user_id = "U5c4d7b2696c38667657d08fa60f49011"; // Anii
    sendPushLine(user_id, message_content);
  }
}

/** LINEメッセージを配信 */
function sendPushLine(user_id, message_content) {
  if (!user_id) {
    var user_id = "line_user_id";;
  }
  if (!message_content) {
    var message_content = '空のメッセージを送信します。'
  }

  var url = "https://api.line.me/v2/bot/message/push";
  var headers = {
    "Content-Type" : "application/json; charset=UTF-8",
    'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
  };

  var postData = {
    "to" : user_id,
    "messages" : [
      {
        'type':'text',
        'text': message_content,
      }
    ]
  };

  var options = {
    "method" : "post",
    "headers" : headers,
    "payload" : JSON.stringify(postData)
  };

  return UrlFetchApp.fetch(url, options);
}

function getReportingMessageContent(measured_salt, measured_suger){
  message_content = "お塩が残り" + measured_salt + "g、お砂糖が残り" + measured_suger + "あるわね。";
  return message_content;
}

function getCalculatedMessageContent(measured_salt, measured_suger){
  message_content = "…って、あんたバカ！？\n今日だけでお塩" + measured_salt + "g、お砂糖" + measured_suger + "gも使ってんじゃないの！！";
  return message_content;
}

function saveDataToSpreadSheet(timestamp, measured_salt, measured_suger){
  const sheet = SpreadsheetApp.getActiveSheet();
  let lastRow = sheet.getLastRow();
  data = [[timestamp, measured_salt, measured_suger]];
  sheet.getRange(lastRow+1, 1, 1, 3).setValues(data);
}

function getTookAmount(measured_salt, measured_suger){
  const sheet = SpreadsheetApp.getActiveSheet();
  data = sheet.getRange(2, 2, 1, 2).getValues();
  took_salt = data[0][0] - measured_salt;
  took_suger = data[0][1] - measured_suger;
  return [took_salt, took_suger]
}

function getUnixTime(){
  const now = new Date();
  Logger.log(`now: ${now}`);

  const formatNow = Utilities.formatDate(now, 'GMT', 'dd MMM yyyy HH:mm:ss z');
  Logger.log(`formatNow: ${formatNow}`);

  const unixTime = Date.parse(formatNow)/1000;
  Logger.log(`unixTime: ${unixTime}`);
  Logger.log(`unixTime: ${unixTime.toFixed()}`);
  return unixTime.toFixed();
}
