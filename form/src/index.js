import { createClient } from "@supabase/supabase-js";

const environmentInput = document.getElementById("environment");
if (environmentInput) {
  environmentInput.value = __environment;
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
          console.dir(response);
          throw new Error("Network response was not ok", response);
        }
        return response;
      })
      .then((data) => {
        console.log("Success:", data);
        setTimeout(() => {
          window.location.href = "done.html";
        }, Math.floor(Math.random() * 301) + 300);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
