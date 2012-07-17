/*
 * Global
 */
var appContext = null;
var devMode = false;

/*
 * Musubi
 */
Musubi.ready(function(context) {
  console.log("launching StickyNotes");

  if (devMode) return;

  app = new StickyNotesApp();
  
  appContext = context;
  
  var intKey = 0;
  
  console.log("appContext.obj= " + appContext.obj);
  
  var latest = getLatestState();
  if(latest == null) {
    app.newNote('');
  } else {
    app.loadNotes(latest.notes);
  }
  
  appContext.setBack(function() {
    if (dirtyFlag) {
      save();
    }  
    appContext.quit();
  });
  
  function getLatestState() {
    var result = Array();
    if (appContext.obj != null) {
      result = appContext.obj.query("type = 'appstate'", 'int_key desc limit 1');
      console.log("subfeed - query: " + result);
      
      if (!result.length) {
        result = appContext.feed.query("_id = '" + appContext.obj.objId + "'", 'int_key desc limit 1');
        console.log("feed - query: " + result);
      }
    }
    
    if (!result.length) {
      return null;
    }
    else {
      intKey = result[result.length - 1].intKey;
      return result[result.length - 1].json.state;
    }
  }
  
  function save() {
    var text = 'StickyNotes';
    var html = getHtml();
    var state = { notes: app.getNotes() };
    var content = { "__html": html, "text": text, "state": state };
    if (appContext.obj == null) {
      var obj = new SocialKit.Obj({type : "stickynotes", json: content, intKey: intKey});
      appContext.feed.post(obj);
    } else {
      var obj = new SocialKit.Obj({type : "appstate", json: content, intKey: ++intKey});
      appContext.obj.session = appContext.feed.session;
      appContext.obj.post(obj);
    }
  }
  
  function getHtml() {
    var html = '';
    var style = 'button.box{width:25px;height:25px;background-color: rgb(255, 240, 70);border: 1px solid #a80;}'
              + 'button.box.blue{background-color: rgb(135, 206, 250);border: 1px solid rgb(51, 51, 255);}'
              + 'button.box.green{background-color: rgb(152, 251, 152);border: 1px solid rgb(34, 139, 34);}'
              + 'button.box.red{background-color: rgb(255, 182, 193);border: 1px solid rgb(255, 20, 147);}';
    
    html  = '<html><head><style>' + style + '</style></head><body><div style="width: 150px;">';
    html += '<button class="box"></button>';
		html += '<button class="box blue" style="margin-left:5px"></button>';
		html += '<button class="box green" style="margin-left:5px"></button>';
		html += '<button class="box red" style="margin-left:5px"></button>';
		html += '</div><div style="font-size:18px;">StickyNotes</div></body></html>';
		return html;
  }
});
