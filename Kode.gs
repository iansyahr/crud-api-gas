// API-like CRUD operations using Google Apps Script and Google Sheets
// Due to the lack of support for doPut() and doDelete() in GAS, the doPost() function is designed to handle all three operations (CREATE, UPDATE, DELETE).
// For more details, refer to: https://developers.google.com/apps-script/guides/web

var spreadsheetId = 'Insert-your-spreadsheet-ID-here';
var sheetName = 'Sheet1';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    var dataRange = sheet.getDataRange().getValues();
    
    if (data.mode === 'delete') {
      // Delete data based on the id (Similar to DELETE method)
      for (var i = 1; i < dataRange.length; i++) {
        if (dataRange[i][0] == data.id) {
          sheet.deleteRow(i + 1); // Delete the row
          return ContentService.createTextOutput('Data with ID ' + data.id + ' successfully deleted!');
        }
      }
      return ContentService.createTextOutput('ID ' + data.id + ' not found for deletion.');
    } else {
      var idFound = false;
      
      // Check if the id already exists (similar to PUT method)
      for (var i = 1; i < dataRange.length; i++) {
        if (dataRange[i][0] == data.id) {
          sheet.getRange(i + 1, 2).setValue(data.title);    // Update title
          sheet.getRange(i + 1, 3).setValue(data.content);  // Update content
          idFound = true;
          break;
        }
      }

      // If id not found, append new row (similar to POST method)
      if (!idFound) {
        sheet.appendRow([data.id, data.title, data.content]);
        return ContentService.createTextOutput('Data received and successfully added with ID ' + data.id + '!');
      }

      return ContentService.createTextOutput('Data received and successfully updated for ID ' + data.id + '!');
    }
  } catch (error) {
    return ContentService.createTextOutput('Error doPost: ' + error.message);
  }
}

function doGet(e) {
  try {
    var cache = CacheService.getScriptCache();
    var cachedData = cache.get("sheetData");

    if (cachedData) {
      return ContentService.createTextOutput(cachedData).setMimeType(ContentService.MimeType.JSON);
    } else {
      var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
      var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
      
      // Convert the array of data into an array of objects
      var jsonData = data.map(function(row) {
        return {
          id: row[0],
          title: row[1],
          content: row[2]
        };
      });

      var jsonString = JSON.stringify(jsonData);
      cache.put("sheetData", jsonString, 60); // Cache the result for 1 minutes

      return ContentService.createTextOutput(jsonString).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return ContentService.createTextOutput('Error in doGet: ' + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
