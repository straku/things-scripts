import { execSync } from "child_process";

import meow from "meow";
import dayjs from "dayjs";

function getDailyProgress(length, days, startPage) {
  const dailyPrecise = (length - startPage) / days;
  let daily = Math.round(dailyPrecise);
  if (daily < dailyPrecise) daily += 1;

  let dailyProgress = [];
  for (
    let currentPage = startPage, i = 0;
    currentPage < length;
    currentPage += daily, i++
  ) {
    if (currentPage > length - daily) {
      const left = length - currentPage;
      if (left < 0.5 * daily) {
        dailyProgress[i - 1] += left;
        break;
      }
      dailyProgress.push(left);
    } else {
      dailyProgress.push(daily);
    }
  }
  return dailyProgress;
}

function getTodos(bookName, length, days, startPage = 0) {
  const dailyProgress = getDailyProgress(length, days, startPage);
  let todos = [];
  let currentPage = startPage;
  for (const pages of dailyProgress) {
    todos.push(`${bookName}, pp. ${currentPage} - ${currentPage + pages}`);
    currentPage += pages;
  }
  return todos;
}

function addToThings(todos, listId = "") {
  const today = dayjs();
  todos.forEach((todo, i) => {
    const title = encodeURIComponent(todo);
    const when = today.add(i + 1, "day").format("YYYY-MM-DD");
    execSync(
      `open "things:///add?title=${title}&list-id=${listId}&when=${when}"`
    );
  });
}

const helpText = `
  Script to create todos for your book reading habbit. Created todos will be
  scheduled daily, starting from tomorrow until the book will be finished.

  Options
    --book (required)  Name of the book
    --length (required)  Length of the book
    --days (required)  Amount of days that you want to spend reading the book
    --start-page  Current page (if you already started reading)
    --list-id  The ID of a project or area to add to in Things
`;

const cli = meow(helpText, {
  importMeta: import.meta,
  flags: {
    book: {
      type: "string",
      isRequired: true,
    },
    length: {
      type: "number",
      isRequired: true,
    },
    days: {
      type: "number",
      isRequired: true,
    },
    startPage: {
      type: "number",
    },
    listId: {
      type: "string",
    },
  },
});

const { book, length, days, startPage, listId } = cli.flags;

const todos = getTodos(book, length, days, startPage);

addToThings(todos, listId);
