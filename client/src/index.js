import { createClient } from '@supabase/supabase-js'
const environment = process.env?.NODE_ENV ? process.env.NODE_ENV : "development";
const supabaseUrl = 'https://lighsugaslqwzynyhnzl.supabase.co'
const supabaseKey = process.env?.SUPABASE_KEY ? process.env.SUPABASE_KEY : undefined;

if (!supabaseKey){
  console.error('No database key found');
}


const config = {
  serverUrl: "http://localhost:8080/server/snaCamp"
};

const environmentInput = document.getElementById("environment");
if (environmentInput) {
  environmentInput.value = environment;
}

if (environment) {
  // Add development-specific configuration here if needed
  config.serverUrl = "https://sna-camp-form.jujhar.com/server/snaCamp";
}

const aloo = {
  gobi: () => console.log("gobi is a nice sabji")
};

console.log(aloo.gobi());
document.getElementById('registrationForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const supabase = createClient(supabaseUrl, supabaseKey)


  const dob = document.getElementById('dob').value;
  const yearAttendedBefore = document.getElementById('yearAttendedBefore').value;

  if (yearAttendedBefore && (yearAttendedBefore < 1900 || yearAttendedBefore > new Date().getFullYear())) {
    alert('Please enter a valid year for "Year Attended Before".');
    return;
  }

  if (new Date(dob) > new Date()) {
    alert('Please enter a valid date of birth.');
    return;
  }

  const formData = new FormData(this);
  const jsonData = Object.fromEntries(formData.entries());

  fetch(config.serverUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jsonData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      alert('Form submitted successfully!');
      console.log('Success:', data);
    })
    .catch(error => {
      alert('There was a problem with your submission: ' + error.message);
      console.error('Error:', error);
    });
});
