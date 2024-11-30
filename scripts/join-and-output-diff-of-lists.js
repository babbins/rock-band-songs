import fs from "fs";

const oldList = JSON.parse(
  fs.readFileSync("../src/newest-list-with-artwork.json", "utf8")
);

const newList = JSON.parse(fs.readFileSync("../src/test-list.json", "utf8"));

console.log(oldList.length, newList.length);
// console.log(oldList.length, newList.length);

// alisPicks.forEach((pick) => {
//   const pickTitle = pick.title.toLowerCase().trim();
//   const match = list.find((song) => {
//     return song.title.toLowerCase().trim() === pickTitle;
//   });
//   if (match) {
//     console.log("Matched", pick.title);
//     match.alisPick = true;
//   }
// });

// fs.writeFileSync("./list-with-picks.json", JSON.stringify(list));
