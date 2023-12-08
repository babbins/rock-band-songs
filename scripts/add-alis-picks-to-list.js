import fs from "fs";

const alisPicks = JSON.parse(fs.readFileSync("./alis-picks.json", "utf8"));
const list = JSON.parse(fs.readFileSync("../src/list-with-picks.json", "utf8"));

alisPicks.forEach((pick) => {
  const pickTitle = pick.title.toLowerCase().trim();
  const match = list.find((song) => {
    return song.title.toLowerCase().trim() === pickTitle;
  });
  if (match) {
    console.log("Matched", pick.title);
    match.alisPick = true;
  }
});

fs.writeFileSync("./list-with-picks.json", JSON.stringify(list));
