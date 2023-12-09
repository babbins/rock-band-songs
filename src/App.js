import * as React from "react";
import "./styles.css";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { LazyLoadImage } from "react-lazy-load-image-component";
import newestList from "./newest-list-with-artwork.json";
import debounce from "lodash.debounce";

const LIST = newestList
  .filter((song) => !!song)
  .filter((song, i) => {
    return !["Unknown", "Other"].includes(song.genre);
  });
window.LIST = LIST;
const genres = new Set();

LIST.forEach((song) => {
  if (song.genre) {
    genres.add(song.genre);
  }
});

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor("artist", {
    cell: (info) => info.getValue(),
    header: "Artist",
  }),
  columnHelper.accessor("title", {
    cell: (info) => {
      return (
        <div className="title-cell">
          <span>{info.getValue()}</span>
          {info.row.original.alisPick ? <img src={"ali-2.png"} /> : null}
        </div>
      );
    },
    header: "Song",
  }),
  columnHelper.accessor("artwork", {
    cell: (info) =>
      info.getValue() ? (
        <LazyLoadImage
          alt={`${info.row.artist} - ${info.row.title}`}
          height={60}
          src={info.getValue()}
          width={60}
        />
      ) : null,
    header: null,
  }),
];

export default function App() {
  const [input, setInput] = React.useState("");
  const [selectedGenre, setSelectedGenre] = React.useState("all");
  const [isAlisPicks, setIsAlisPicks] = React.useState(false);
  const [queryValue, setQueryValue] = React.useState("");
  const debouncedSetQueryValue = React.useMemo(
    () =>
      debounce((input) => {
        setQueryValue(input);
        setSelectedGenre("all");
        setIsAlisPicks(false);
        scrollToTop();
      }, 500),
    []
  );

  const filteredSongs = React.useMemo(
    () =>
      LIST.filter((song) => {
        const normalizedQuery = normalize(queryValue);
        return (
          (normalize(song.artist).includes(normalizedQuery) ||
            normalize(song.title).includes(normalizedQuery)) &&
          (selectedGenre === "all" || song.genre === selectedGenre) &&
          (isAlisPicks ? song.alisPick === true : true)
        );
      }).sort((a, b) => {
        const aArtist = a.artist.toLowerCase().startsWith("the")
          ? a.artist.toLowerCase().replace("the", "").trim()
          : a.artist;
        const bArtist = b.artist.toLowerCase().startsWith("the")
          ? b.artist.toLowerCase().replace("the", "").trim()
          : b.artist;
        return aArtist.localeCompare(bArtist);
      }),
    [queryValue, selectedGenre, isAlisPicks]
  );

  const table = useReactTable({
    data: filteredSongs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const tableRender = React.useMemo(() => {
    return (
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    );
  }, [JSON.stringify(filteredSongs)]);

  return (
    <div className="App">
      <BackToTop />
      <div className="sticky">
        <h1>🎸 Ali's Rock Band Party Song List 🤘</h1>
        <div className="header-row">
          <div className="filters">
            <input
              placeholder="🔎 Filter by Artist or Song"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                debouncedSetQueryValue(e.target.value);
              }}
            />
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setInput("");
                setQueryValue("");
                scrollToTop();
              }}
            >
              <option value="all">All Genres</option>
              {Array.from(genres).map((genre) => (
                <option
                  selected={selectedGenre === genre}
                  key={genre}
                  value={genre}
                >
                  {genre}
                </option>
              ))}
            </select>
          </div>
          <div
            className={
              isAlisPicks
                ? "starburst-wrapper starburst-wrapper-active"
                : "starburst-wrapper"
            }
          >
            {isAlisPicks ? (
              <>
                <img src="ali-2.png" className="ali-left" />
                <img src="ali-2.png" className="ali-right" />
                <img src="ali-2.png" className="ali-left-bot" />
                <img src="ali-2.png" className="ali-right-bot" />
              </>
            ) : null}
            <button
              class={isAlisPicks ? "starburst starburst-active" : "starburst"}
              onClick={() => {
                scrollToTop();
                setIsAlisPicks(!isAlisPicks);
              }}
            >
              {isAlisPicks ? "Back to All Songs" : "Tap here for Ali's Picks"}
            </button>
          </div>
        </div>
      </div>
      {filteredSongs.length ? (
        tableRender
      ) : (
        <h3>
          😓 No Results{" "}
          <button
            onClick={() => {
              setInput("");
              setQueryValue("");
              setSelectedGenre("all");
              setIsAlisPicks(false);
              scrollToTop();
            }}
          >
            Clear Filters
          </button>
        </h3>
      )}
    </div>
  );
}

const normalize = (str) => {
  return str.toLowerCase().trim();
};

const BackToTop = () => {
  return (
    <button className="backToTop" onClick={scrollToTop}>
      Back to Top
    </button>
  );
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
};
