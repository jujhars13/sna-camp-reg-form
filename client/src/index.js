import { createClient } from "@supabase/supabase-js";

const environmentInput = document.getElementById("environment");
if (environmentInput) {
  environmentInput.value = __environment;
}

// set date to 8 years ago to make things easier
const dob = document.getElementById("dob");
dob.value=new Date(new Date().getFullYear() - 8, new Date().getMonth(), new Date().getDay()).toISOString().split('T')[0];

/**
 * Handle form submission
 */
document
  .getElementById("registrationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const dob = document.getElementById("dob").value;
    const yearAttendedBefore =
      document.getElementById("yearattendedbefore").value;

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

    const supabase = createClient(__supabase_url, __supabase_key);
    supabase
      .from("snacamp")
      .insert(jsonFormData)
      .then((response) => {
        if (response?.status !== 201) {
          console.dir(response);
          throw new Error("Network response was not ok", response);
        }
        return response;
      })
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
