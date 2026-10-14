We want to create a reports page will show all the campers for a given camp.
the list of camps can be found in app/src/data
We can pick camps on the report page via a menu
The reports page will not show a camp report by default
We want to show all the data to begin with but I will restrict the SQL later
Do not show soft deleted records
It will grab the data from Supabase via a SQL query
It will be fronted by an oauth-proxy container
We can use traefik proxy inside the docker compose to route /admin to our reports oauth container and then to the reports application if oauth is successful
We'll use gcp oauth credentials inside the oauth-proxy container
We'll maintain a yaml file which will act as a rudimentary authZ which will dictate which email address can access which camp reports
The reports need to be printable on A4 paper