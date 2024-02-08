function toTime(seconds: number): string {
  const weeks = Math.floor(seconds / (3600 * 24 * 7));
  const days = Math.floor((seconds % (3600 * 24 * 7)) / (3600 * 24));
  let hours = Math.floor((seconds % (3600 * 24)) / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let secondsLeft = seconds % 60;
  let timeString = "";

  if (weeks > 0) {
    timeString += `${weeks}w `;
  }

  if (days > 0 || weeks > 0) {
    timeString += `${days}d `;
  }

  if (hours > 0 || days > 0 || weeks > 0) {
    timeString += `${hours < 10 ? `0${hours}` : hours}:`;
  }

  timeString += `${minutes < 10 ? `0${minutes}` : minutes}:${
    secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft
  }`;

  return timeString;
}

function toDate(value: string | number | Date): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let month = date.getMonth();
  let day = date.getDate();

  return `${day < 10 ? `0${day}` : day} ${monthNames[month]} ${year}`;
}

export { toTime, toDate };
