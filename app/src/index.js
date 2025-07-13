import { createClient } from "@supabase/supabase-js";

let version = __version;
let environment = __environment;

const environmentInput = document.getElementById("environment");
if (environmentInput) {
  environmentInput.value = environment || "development";
}
let eventData = {};

document.addEventListener("DOMContentLoaded", () => {
  // DOM is fully loaded
  const domain = window.location.hostname;
  console.log({ version, environment, domain });
  let eventJson = "test.json"; // Default to test.json

  switch (domain) {
    case "stratford.snaform.com":
      eventJson = "2025-08-11-stratford-road.json";
      break;
    case "westbrom.snaform.com":
      eventJson = "2025-08-04-west-bromwich.json";
      break;
    case "wolves.snaform.com":
      eventJson = "2025-08-18-wolves.json";
      break;
    case "oldbury.snaform.com":
      eventJson = "2025-08-25-oldbury.json";
      break;
    case "localhost":
    case "test.snaform.com":
      eventJson = "test.json";
      break;
    default:
      eventJson = undefined;
      return;
  }

  document.getElementById("version-display").textContent = `${version}:${environment}`;

  document.getElementById("loading-overlay").classList.add("visible");

  fetch(`data/${eventJson}`)
    .then((response) => response.json())
    .then((data) => {
      eventData = data;
      if (!updateEventDetails(eventData)) {
        throw new Error("Failed to update event details");
      }

      // make page ready for use
      document.getElementById("submit").disabled = false;
      document.getElementById("loading-overlay").classList.remove("visible");
    })
    .catch((error) => {
      console.error("Error fetching event data:", error);
      if (
        window.Sentry &&
        typeof window.Sentry.captureException === "function"
      ) {
        window.Sentry.captureException(error);
      }
    })
    .finally(() => {
      // dont' do anything
    });
});

/**
 * Updates the event details on the page using the provided event data.
 *
 * Sets the human-readable event name and camp name in the DOM.
 * If the event does not include t-shirt information, removes the t-shirt size selection from the form.
 *
 * @param {Object} eventData - The event data object loaded from the JSON file.
 * @param {string} [eventData.humanName] - The human-readable name of the event.
 * @param {string} [eventData.name] - The internal or short name of the camp/event.
 * @param {boolean} [eventData.tshirts] - Indicates if t-shirt selection is available for the event.
 */
function updateEventDetails(eventData) {
  const humanNameElement = document.getElementById("humanName");
  if (humanNameElement) {
    humanNameElement.textContent = eventData.humanName || "Event Name";
  }
  const campNameElement = document.getElementById("campname");
  if (campNameElement) {
    campNameElement.textContent = eventData.name || "unknown-from-json";
  }

  const versionInput = document.getElementById("version");
  if (versionInput) {
    versionInput.value = version;
  }

  const environmentInput = document.getElementById("environment");
  if (versionInput) {
    environmentInput.value = environment;
  }

  if (!eventData.tshirts) {
    const tshirtDiv = document.getElementById("div-tshirt-size");
    if (tshirtDiv) {
      tshirtDiv.remove();
    }
  }
  return true;
}

/**
 * Handle form submission
 */
document
  .getElementById("registrationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const dob = document.getElementById("dob").value;

    if (new Date(dob) > new Date()) {
      alert("Please enter a valid date of birth.");
      return;
    }

    const formData = new FormData(this);
    const jsonFormData = Object.fromEntries(formData.entries());
    const supabase = createClient(__supabase_url, __supabase_key);
    document.getElementById("submit").disabled = true;

    supabase
      .from("snacamp")
      .insert(jsonFormData)
      .then((response) => {
        if (response?.status !== 201) {
          console.error({ response });
          throw new Error("Network response was not ok", response);
        }
        return response;
      })
      .then((data) => {
        console.log("Success:", data);
        setTimeout(
          () => {
            window.location.href = "done.html";
          },
          Math.floor(Math.random() * 301) + 300
        );
      })
      .catch((error) => {
        console.error("Error:", error);
        if (
          window.Sentry &&
          typeof window.Sentry.captureException === "function"
        ) {
          window.Sentry.captureException(error);
        }
      });
  });
