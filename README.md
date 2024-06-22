# Установка

```bash
npm i @op-web-code/tele2-ats2-sdk
yarn add @op-web-code/tele2-ats2-sdk
```

# Информация

**Весь код написан на JavaScript, но присутствует полная поддержка Typescript**

_Реализованны не все методы Tele2Ats2, только те в которых была необходимость_

# Использования

```js
const tele2ats2sdk = require("@op-web-code/tele2-ats2-sdk");

const client = tele2ats2sdk.Tele2Ats2Client({
  /**
   * Можно написать имплементацию для tele2ats2sdk.AbstractTokenStore, чтобы брать токены из базы, или из редиса
   *
   * Если токен умрёт, то Tele2Ats2Client, попробует сделать запрос на новые токены и сохранить их через AbstractTokenStore, если не получиться, будет пробовать получить токены из AbstractTokenStore (предполагаю, что там уже лежат новые токены)
   */
  tokenStore: new FileTokenStore({
    refreshToken: `eyJhbGciOiJIUzUxMiJ9.eyJVc2VyRGV0YWlsc0ltcGwiOnsiY29tcGFueUlkIjoxNjkxNywidXNlcklkIjozNDI0NCwibG9naW4iOiI3MTYzMzE5NTgwMCJ9LCJzdWIiOiJSRUZSRVNIX09QRU5BUElfVE9LRU4iLCJleHAiOjE3MTg3MzE5MDJ9._zrWnS0Mc0YOO-ImCDxES6hf7GmgICT3M5j63qau-BJgCAuKEVcM7b_3YEdDzj1qeWvRI2x5m9b8JJT1mRcs4w`,
  }),
  proxyStore: new tele2ats2.StaticProxyStore({
    host: "194.62.184.30",
    port: +"2717",
    user: "kin7080",
    pass: "g801hv",
  }),
});

// Пример как можно совершить звонок через TeleAts2
// Записи звонков доступны только с корпоративных номеров сотрудников (метка у номера - 'Основной')
client
  .click2call({
    clientPhone: "79045680602",
    employeePhone: "79282510341",
  })
  .then(() => {
    // При совершении звонка мы не получем от теле2 никаких идентификаторов, поэтому если нужно матчить звонок со своей базой придёться делать это по времени
    console.log("Звонок успешно совершён, сейчас будет открыт мост");
  });

// Пример показывает как можно выгрузить информацию о совершённых звонках за некоторый промежуток времени через CRM Tele2Ats2
const currentDate = new Date();
const date3DaysAgo = new Date();

date3DaysAgo.setDate(date3DaysAgo.getDate() - 3);

client
  .callRecordsInfo({
    dateFrom: date3DaysAgo,
    dateTo: currentDate,
    hasRecorded: true,
    caller: "79045680602",
    callee: "79282510341",
    size: 50,
    page: 0,
    sort: {
      key: "date",
      order: "asc",
    },
  })
  .then((records) => {
    for (const record of records) {
      /** CRM_OUTGOING - звонок через CRM Tele2Ats2 */
      if (record.callType === "CRM_OUTGOING") {
        console.log("Звонок через CRM Tele2Ats2, файл", record.recordFileName);
      }
    }
  });

// Пример показывает как скачать аудиозапись звонка
client
  .callRecordsFile({
    recordFileName: "demo/record",
  })
  .then(async (file) => {
    // const stream = file.octetstream;
    const buffer = await file.toBuffer();
    await fs.writeFile(`./${file.filename.replace("/", ".")}.mp3`);
  });
```
