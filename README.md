# TallyLogger
Logging switcher via tally - export to AAF AVB OTIO and XML for PP

Working within a Venv within TallyLogger folder (`source .venv/bin/activate`). The Venv requires imports of modules - `aaf` `opentimelineio` and `avb`.

Entry point is `node server.js` - node.js application which runs an http server and populates a web page with buttons to turn on TCP or UDF (run tally arbiter to generate Tally signals to test).
 
NB aaf and avb and otio exports have destination hard coded in `helpers/python-scripts.js`

Tally events are logged

