/*
 * Global
 */
var app = null;
var notesList = new Array();
var highestZindex = 0;
var dirtyFlag = false;

/*
 * StickyNote Class
 */
function StickyNote(color) {
  if(typeof color === 'undefined') color = '';
  
  var self = this;

  var note = $('<div/>');
  note.addClass('note ' + color);
  this.note = note;
  this.color = color;
  
  var deleteButton = $('<div/>');
  deleteButton.addClass('delete');
  deleteButton.html('&times;');
  deleteButton.bind('click', $.proxy(this.deleteNote, this));
  this.deleteButton = deleteButton;
  
  var dragArea = $('<div/>');
  dragArea.addClass('drag-area ' + color);
  dragArea.attr('id', 'drag-area');
  dragArea.append(deleteButton);
  note.append(dragArea);
  this.dragArea = dragArea;
  
  var editArea = $('<textarea/>');
  editArea.addClass('edit-area ' + color);
  editArea.bind('change', function(){dirtyFlag = true;});
  note.append(editArea);
  this.editArea = editArea;
  
  note.hide();
  $('#notes').append(note);
  note.fadeIn(200);
  
  // important: enable draggable here for iOS
  note.draggable({
    handle: '.drag-area',
    start: function(event, ui) {
      self.setZindexPos(++highestZindex);
      self.note.addClass('drag-note');
      self.deleteButton.hide();
    },
    stop: function(event, ui) {
      //dirtyFlag = true;
      self.note.removeClass('drag-note');
      self.deleteButton.show();
    }
  });
  
  notesList.push(this);
  
  if (devMode) {
    var test = $('<button/>');
    test.html('test');
    test.css('margin-top', '100px');
    $('#notes').append(test);
    test.bind('click', app.getNotes);
  }
  
  return this;
}

StickyNote.prototype = {
  getId: function() {
    return this.uuid;
  },
  
  setId: function(uuid) {
    this.uuid = uuid;
  },
  
  getText: function() {
    return this.editArea.val();
  },
  
  setText: function(text) {
    this.editArea.val(text);
  },
  
  getLeftPos: function() {
    return this.note.css('left');
  },
  
  setLeftPos: function(pos) {
    this.note.css('left', pos);
  },
  
  getTopPos: function() {
    return this.note.css('top');
  },
  
  setTopPos: function(pos) {
    this.note.css('top', pos);
  },
  
  getZindexPos: function() {
    return this.note.css('zIndex');
  },
  
  setZindexPos: function(pos) {
    this.note.css('zIndex', pos);
  },
  
  deleteNote: function(e) {
    e.preventDefault();
    var self = this;
    
    self.note.fadeOut(300, function() {
      var index = notesList.indexOf(this);
      notesList.splice(index, 1);
      dirtyFlag = true;
      self.note.remove();
    });
  }
};

/*
 * StickyNotes App Class
 */
function StickyNotesApp() {
  var self = this;
  
  return this;
}

StickyNotesApp.prototype = {
  
  newNote: function(color) {
    this._createNote(
      color,
      this._getUuid(),
      Math.round(Math.random() * (document.width / 3)) + 'px',
      Math.round(Math.random() * (document.height / 3)) + 50 + 'px',
      ++highestZindex,
      ''
    );
  },
  
  loadNotes: function(notes) {
    for (var i in notes) {
      var obj = notes[i];
      this._createNote(
        obj.color,
        obj.uuid,
        obj.style.left,
        obj.style.top,
        obj.style.zIndex,
        obj.text
      );
      
      if(obj.style.zIndex > highestZindex)
        highestZindex = obj.style.zIndex;
    }
    
    if (!notes.length) {
      this.newNote('');
    }
  },
  
  getNotes: function() {
    var state;
    var notes = Array();
    for (var i in notesList) {
      var note = notesList[i];
      var obj = {
        uuid: note.getId(),
        text: note.getText(),
        color: note.color,
        style: {
          left: note.getLeftPos(),
          top: note.getTopPos(),
          zIndex: note.getZindexPos()
        }
      };
      notes.push(obj);
    }
    //console.origLog(JSON.stringify(notes));
    return notes;
  },
  
  _createNote: function(color, uuid, left, top, zindex, text) {
    var note = new StickyNote(color);
    note.setId(uuid);
    note.setLeftPos(left);
    note.setTopPos(top);
    note.setZindexPos(zindex);
    note.setText(text);
    note.note.css('position', 'absolute'); // important: jquery ui draggable set relative to position, so should overwrite
    return note;
  },
  
  _getUuid: function() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }
};

$(document).ready(function(){
  if (devMode) {
    app = new StickyNotesApp();
    var json = '{"notes":[{"uuid":"c477e7d1-2674-a55d-da46-21909d0a05b2","text":"2","color":"","style":{"left":"97px","top":"163px","zIndex":"11"}},{"uuid":"c5c4eb7c-7488-e75c-a033-e666f7a6bf8a","text":"4","color":"","style":{"left":"152px","top":"236px","zIndex":"13"}},{"uuid":"93f0f090-4a49-7fc2-a027-ca2d3b559422","text":"3","color":"blue","style":{"left":"125px","top":"205px","zIndex":"12"}},{"uuid":"9d9a05ee-8526-bac4-011a-3455a33900a7","text":"1","color":"red","style":{"left":"67px","top":"124px","zIndex":"10"}}]}';
    var parsed = JSON.parse(json);
    app.loadNotes(parsed.notes);
  }

  $('.new-note').click(function (e) {
    e.preventDefault();
    
    var color = $(this).attr('color');
  	app.newNote(color);
  });
});