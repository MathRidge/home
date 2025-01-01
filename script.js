  // Get current date and time
  var d = new Date();
  var datetime = d.toLocaleString("en-US", {dateStyle: "medium",});

  // Insert date and time into HTML
  document.getElementById("datetime").innerHTML = datetime;