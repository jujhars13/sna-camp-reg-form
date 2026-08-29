return false;
import { createClient } from "@supabase/supabase-js";

// biome-ignore lint/correctness/noUndeclaredVariables: subbed in by webpack
const version = __version;
// biome-ignore lint/correctness/noUndeclaredVariables: subbed in by webpack
const environment = __environment;
// biome-ignore lint/correctness/noUndeclaredVariables: subbed in by webpack
const supabaseUrl = __supabase_url;
// biome-ignore lint/correctness/noUndeclaredVariables: subbed in by webpack
const supabaseKey = __supabase_key;

const environmentInput = document.getElementById("environment");
if (environmentInput) {
  environmentInput.value = environment || "development";
}
let eventData = {};

/**
 * WCAG relative luminance of a #rgb or #rrggbb colour, 0 (black) to 1 (white).
 * Returns null if the colour can't be parsed.
 */
function relativeLuminance(hex) {
  const value = (hex || "").trim().replace(/^#/, "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  if (!/^[0-9a-f]{6}$/i.test(full)) {
    return null;
  }
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = Number.parseInt(full.slice(i, i + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Picks the Pico theme that stays legible on the event's background colour.
 *
 * The event background is applied to <body> regardless of the device setting,
 * so we can't let Pico follow prefers-color-scheme on its own — a phone in dark
 * mode would put near-white text on a pale background. Locking data-theme to
 * whichever palette contrasts with the background keeps the text readable and
 * keeps the form controls consistent with the page.
 *
 * Threshold is the luminance where black text overtakes white text on contrast
 * ratio: (L + 0.05)^2 > 0.05 * 1.05.
 */
function applyLegibleTheme(bgcolour) {
  const luminance = relativeLuminance(bgcolour);
  if (luminance === null) {
    return;
  }
  const theme = luminance > 0.1791 ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme);
  // keeps iOS native controls (keyboard, date/select pickers, autofill,
  // scrollbars) on the same side as the page
  document.documentElement.style.colorScheme = theme;
}

document.addEventListener("DOMContentLoaded", () => {
  // DOM is fully loaded
  const domain = window.location.hostname;
  console.log({ version, environment, domain });
  let eventJson = "test.json"; // Default to test.json

  switch (domain) {
    case "stratford.snaform.com":
      eventJson = "2026-08-10-stratford-road.json";
      break;
    case "westbrom.snaform.com":
      eventJson = "2026-07-20-west-bromwich.json";
      break;
    case "oldbury.snaform.com":
    case "wolves.snaform.com":
    case "localhost":
    case "test.snaform.com":
      eventJson = "test.json";
      break;
    default:
      eventJson = undefined;
      return;
  }

  document.getElementById("version-display").textContent =
    `${version}:${environment}`;

  document.getElementById("loading-overlay").classList.add("visible");

  // Fetch the event data from the JSON file
  // use verison number to bust cache
  fetch(`data/${eventJson}?v=${version}`)
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
      console.error("Error fetching/rendering event data:", error);
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

  const bgcolour = eventData?.bgcolour || "#f0f0f0";
  document.body.style.backgroundColor = bgcolour;
  applyLegibleTheme(bgcolour);

  if (humanNameElement) {
    humanNameElement.textContent = eventData.humanName || "Event Name";
  }
  const campNameElement = document.getElementById("campname");
  if (campNameElement) {
    campNameElement.value = eventData.name || "unknown-from-json";
  }

  const dob = document.getElementById("dob");
  if (eventData?.ageLimits?.minimum) {
    dob.setAttribute("data-minimum-age", eventData.ageLimits.minimum);
  }

  const versionInput = document.getElementById("formversion");
  if (versionInput) {
    versionInput.value = version;
  }

  const environmentInput = document.getElementById("environment");
  if (versionInput) {
    environmentInput.value = environment;
  }

  const eventDateElement = document.getElementById("eventDate");
  if (eventDateElement) {
    const eventDateFrom = new Date(eventData?.date?.from);
    const eventDateTo = new Date(eventData?.date?.to);
    if (eventDateFrom) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      eventDateElement.textContent = `${eventDateFrom.toLocaleDateString(
        "en-GB",
        options
      )} - ${eventDateTo.toLocaleDateString(
        "en-GB",
        options
      )}`;
    }eventData.eventDate
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
  .addEventListener("submit", (event) => {
    event.preventDefault();

    const dob = document.getElementById("dob").value;
    const minimumAge = document
      .getElementById("dob")
      .getAttribute("data-minimum-age");
    if (minimumAge && dob) {
      const dobDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dobDate.getDate())
      ) {
        age--;
      }
      if (age < minimumAge) {
        alert(
          `Your child must be at least ${minimumAge} years old to register`
        );
        return;
      }
    }

    if (new Date(dob) > new Date()) {
      alert("Please enter a valid date of birth");
      return;
    }

    // validation passed, proceed with form submission
    const formData = new FormData(event.target);
    const jsonFormData = Object.fromEntries(formData.entries());

    const supabase = createClient(supabaseUrl, supabaseKey);
    const submitButton = document.getElementById("submit");
    if (submitButton) {
      submitButton.textContent = "Submitting...";
      submitButton.disabled = true;
    }
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.classList.add("visible");
    }

    supabase
      .from("snacamp")
      .insert(jsonFormData)
      .then((response) => {
        if (response?.status !== 201) {
          console.error({ response });
          throw new Error("Supabase response was not ok", response);
        }
        return response;
      })
      .then((data) => {
        console.log("Success:", data);
        document.getElementById("loading-overlay").classList.remove("visible");
        setTimeout(
          () => {
            window.location.href = "done.html";
          },
          Math.floor(Math.random() * 301) + 300
        );
      })
      .catch((error) => {
        console.error("Supbabase submission Error:", error);
        if (
          window.Sentry &&
          typeof window.Sentry.captureException === "function"
        ) {
          window.Sentry.captureException(error);
        }
      });
  });
