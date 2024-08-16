import { createClient } from "@supabase/supabase-js";

const environmentInput = document.getElementById("environment");
if (environmentInput) {
  environmentInput.value = ENVIRONMENT;
}

/**
 * Handle form submission
 */
document
  .getElementById("registrationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const dob = document.getElementById("dob").value;
    const yearAttendedBefore =
      document.getElementById("yearAttendedBefore").value;

    if (
      yearAttendedBefore &&
      (yearAttendedBefore < 1900 ||
        yearAttendedBefore > new Date().getFullYear())
    ) {
      alert('Please enter a valid year for "Year Attended Before".');
      return;
    }

    if (new Date(dob) > new Date()) {
      alert("Please enter a valid date of birth.");
      return;
    }

    const formData = new FormData(this);
    const jsonFormData = Object.fromEntries(formData.entries());

    const supabase = createClient(SUPABASEURL, SUPABASEKEY);
    supabase
      .from("snacamp")
      .insert([jsonFormData])
      .select()
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        alert("Form submitted successfully!");
        console.log("Success:", data);
      })
      .catch((error) => {
        alert("There was a problem with your submission: " + error.message);
        console.error("Error:", { error });
      });
  });
