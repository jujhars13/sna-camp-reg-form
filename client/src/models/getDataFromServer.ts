let url = "https://kitchen-dashboard.home.jujhar.com/server/data";
if (process.env.NODE_ENV === "development") {
  url = "http://localhost:4000/data";
}

type dashboardData = {
  tabletsData: Date[];
  minnieFedData: Date[];
  powerData: string[];
};
/**
 * Fetches data from the server.
 * @returns {Promise<Date[]>} A promise that resolves to an array of Date objects.
 * @throws {Error} If the response status is not ok or an error occurs during the fetch.
 */
function getData(): Promise<dashboardData> {
  return fetch(url, { tls: { rejectUnauthorized: false } })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error({ error });
      throw error;
    });
}

export { getData };
export type { dashboardData };
