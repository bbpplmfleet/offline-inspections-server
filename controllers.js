const readDB = async () => {
  try {
    return await fs.readFile("./db.json");
  } catch (e) {
    console.log(e);
  }
};
const appendToDB = async (newData) => {
  let currentDBState = await readDB(); // returns json string
  let result = JSON.parse(currentDBState); // parse db state as an obj[]
  result = [newData, ...result]; // push the new record to the list
  currentDBState = JSON.stringify(result); // convert back to json
  var writeStream = createWriteStream("db.json");
  writeStream.write(currentDBState); // write new data
  writeStream.end();
  return "success";
};
module.exports = {
  readDB,
  appendToDB,
};
