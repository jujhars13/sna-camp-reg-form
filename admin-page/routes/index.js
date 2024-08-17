const createClient = require("@supabase/supabase-js").createClient;
var express = require("express");
var router = express.Router();

const { SUPABASE_PRIVATE_KEY, SUPABASE_URL } = process.env;

/* GET home page. */
router.get("/", async function (req, res, next) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_PRIVATE_KEY);

  const { data, error } = await supabase.from("snacamp").select();
  console.debug({ data, error });

  res.render("index", { title: "Express", data });
});

module.exports = router;
