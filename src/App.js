import * as React from "react";
import "./styles.css";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import originalList from "./list.json";
import debounce from "lodash.debounce";

const LIST = originalList.filter(
  ({ genre }) => !["Unknown", "Other"].includes(genre)
);
const genres = new Set();

LIST.forEach((song) => {
  genres.add(song.genre);
});

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor("title", {
    cell: (info) => info.getValue(),
    header: "Title",
  }),
  columnHelper.accessor("artist", {
    cell: (info) => info.getValue(),
    header: "Artist",
  }),
];

export default function App() {
  const [input, setInput] = React.useState("");
  const [selectedGenre, setSelectedGenre] = React.useState("all");
  const [queryValue, setQueryValue] = React.useState("");
  const debouncedSetQueryValue = React.useMemo(
    () => debounce(setQueryValue, 300),
    []
  );

  React.useEffect(() => {
    debouncedSetQueryValue(input);
  }, [input, debouncedSetQueryValue]);

  const filteredSongs = React.useMemo(
    () =>
      LIST.filter((song) => {
        const normalizedQuery = normalize(queryValue);
        return (
          (normalize(song.artist).includes(normalizedQuery) ||
            normalize(song.title).includes(normalizedQuery)) &&
          (selectedGenre === "all" || song.genre === selectedGenre)
        );
      }),
    [queryValue, selectedGenre]
  );

  const table = useReactTable({
    data: filteredSongs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="App">
      <h1>🎸 Ali's Rock Band Party Song List 🤘</h1>

      <div className="filters">
        <input
          placeholder="🔎 Filter by Artist or Song"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
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
      {filteredSongs.length ? (
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
      ) : (
        <h3>
          😓 No Results{" "}
          <button
            onClick={() => {
              setInput("");
              setSelectedGenre("all");
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
