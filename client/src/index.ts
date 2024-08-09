import "./index.css";
import { dashboardData, getData } from "./models/getDataFromServer.ts";

document.title = `Kitchen Dashboard`;

const contentDiv = document.createElement("div");
contentDiv.id = "content";
contentDiv.className = "content";

let data: dashboardData = {
  tabletsData: [],
  minnieFedData: [],
  powerData: []
};
try {
  data = await getData();
} catch (err) {
  console.error({ err });
  contentDiv.classList.add("error");
}

const pageElements = {
  /**
   * Render minnie fed data
   * @param data[] array of dates
   * @returns HTMLDivElement HTML element
   */
  renderMinnieFedData: (data: Date[]): HTMLDivElement => {
    const date = new Date(data[0]);
    let hoursSinceDate = Math.floor(
      (new Date().getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    const items = [
      `${date.toLocaleTimeString()} | +${hoursSinceDate}h`,
      `${date.toDateString()}`
    ];

    const containerElement = document.createElement("div");
    containerElement.classList.add("date-time-data");

    items.forEach((item) => {
      let el = document.createElement("li");
      el.textContent = item;
      containerElement.appendChild(el);
    });

    return containerElement;
  },
  /**
   * render tablets data
   * @param data
   * @returns HTMLDivElement
   */
  renderTabletsData: (data: Date[]): HTMLDivElement => {
    const date = new Date(data[0]);
    let hoursSinceDate = Math.floor(
      (new Date().getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    const items = [
      `${date.toLocaleTimeString()} | +${hoursSinceDate}h`,
      `${date.toDateString()}`
    ];

    const containerElement = document.createElement("div");
    containerElement.classList.add("date-time-data");

    items.forEach((item) => {
      let el = document.createElement("li");
      el.textContent = item;
      containerElement.appendChild(el);
    });
    return containerElement;
  },
  /**
   * render power data
   * @param data
   * @returns HTMLDivElement
   */
  renderPowerData: (data: any): HTMLDivElement => {
    const container = document.createElement("div");
    container.id = "power-data";

    const items = [
      `🔋 Battery SoC: ${data.batteryPercentage}`,
      `🔌 Power Demand: ${data.powerDemand}`,
      `⚡ Grid Power: ${data.gridPower}`,
      `☀️ Solar Power: ${data.solarPower}`,
      `🔋⚡ Battery Drain: ${data.batteryPower}`
    ];

    items.forEach((item) => {
      let el = document.createElement("li");
      el.textContent = item;
      container.appendChild(el);
    });
    return container;
  }
};

contentDiv!.innerHTML = `
  <div class="grid">
    <article>
      <h6>Minnie fed 🐶</h6>
      ${pageElements.renderMinnieFedData(data.minnieFedData).outerHTML}
    </article>
    <article>
      <h6>Mr Singh tablets taken 💊</h6>
      ${pageElements.renderTabletsData(data.tabletsData).outerHTML}
    </article>
    <article>
      <h6>Power ⚡</h6>
      ${pageElements.renderPowerData(data.powerData).outerHTML}
    </article>
    </article>
  </div>
`;

document.querySelector("section#primary-section")!.appendChild(contentDiv);

const imageCount = 14;
const randomIndex = Math.floor(Math.random() * imageCount);
const paddedIndex = randomIndex < 10 ? `0${randomIndex}` : randomIndex.toString();
const imageElement = document.createElement("div");
imageElement.id = "background-image";
imageElement.style.backgroundImage = `url(static/images/bg${paddedIndex}.jpg)`;
document.querySelector("body")!.appendChild(imageElement);
