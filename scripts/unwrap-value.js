import fs from "fs";

const list = JSON.parse(
  fs.readFileSync("./new-list-with-artwork.json", "utf8")
);

const newList = list.map((item) => {
  if (item.value) {
    return item.value;
  } else {
    return item;
  }
});

fs.writeFileSync("./new-new.json", JSON.stringify(newList));
