import fs from "fs";

const alisPicksTxt = fs.readFileSync("./alis-picks.txt", "utf8");
const list = [];
alisPicksTxt.split("\n").forEach((line) => {
  const [title, artist] = line.trim().split(" - ");
  console.log(title, artist);
  list.push({ title: title.trim(), artist: artist.trim() });
});

fs.writeFileSync("./alis-picks.json", JSON.stringify(list));
