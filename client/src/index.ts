import "./index.css";

const environment = import.meta.env.MODE || "development";
type Config = {
  serverUrl: string;
};

const config: Config = {
  serverUrl: "http://localhost:8080/server/snaCamp"
};

window.config = config;

const form = document.getElementById("registrationForm");
const environmentInput = document.createElement("input");
environmentInput.type = "hidden";
environmentInput.name = "environment";
environmentInput.value = environment;
if (form) {
  form.appendChild(environmentInput);
}

if (environment) {
  // Add development-specific configuration here if needed
  config.serverUrl = "https://sna-camp-form.jujhar.com/server/snaCamp";
}
