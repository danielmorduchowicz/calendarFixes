jQuery( document ).ready(function() {
   createUI();
   getBookedClasses();
   initializeActionsButton();
   initializeToggleEveningClassesButton();
   initializeToggleLunchClassesButton()
   jQuery(".closeThisButton").click(function(){
     jQuery(this).parent().css("display","none");
   });
   initializeRemoveButton();
   jQuery("#removeDatesFromDB").click(function(){
      removeDatesFromDB();
   })
   initializeAddClassTimeButton();
   jQuery("#saveToDB").click(function(){
     updateDB();
   })
})

function initializeAddClassTimeButton(){
  jQuery("#addClassTime").click(function(){
    addClassTimes();
  })
}

function updateDB(){
  console.log(jQuery("#calendar").data());
  removeDatesFromDB();
  addNewClassesToDB();
}

function addNewClassesToDB(){
  jQuery.each(jQuery("#calendar").data().newDates,function(key,dates){
    var stringRequest = "addDatesToDB.php?key="+key+"&dates="+JSON.stringify(dates);


    $.getJSON(stringRequest, function (response){
      console.log(response);

    });

  });
}

function addClassTimes(){
  var selectedClasses=jQuery("li.ui-selected");
  jQuery(selectedClasses).each(function(){

    jQuery(this).removeClass("ui-selected");
    var clonedClass=jQuery(this).clone(true);
    if(jQuery(this).hasClass("eveningClass")){
      clonedClass.data().date[0]-=25200;
      clonedClass.data().date[1]-=25200;
      clonedClass.removeClass("eveningClass").addClass("lunchClass");
    }
    if(jQuery(this).hasClass("lunchClass")){
      clonedClass.data().date[0]+=25200;
      clonedClass.data().date[1]+=25200;
      clonedClass.removeClass("lunchClass").addClass("eveningClass");
    }
    clonedClass.appendTo(jQuery(this).parent());
    console.log(clonedClass.data().date);
    if(jQuery.isEmptyObject(jQuery("#calendar").data().newDates)){
      jQuery("#calendar").data().newDates={};
    }
    var thisMetaID=clonedClass.data().metaID;
    console.log(thisMetaID);
    if (typeof jQuery("#calendar").data().newDates[thisMetaID] == 'undefined') {
        jQuery("#calendar").data().newDates[thisMetaID]=[];
    }
    jQuery("#calendar").data().newDates[thisMetaID].push(clonedClass.data().date);
  });
}


function initializeToggleEveningClassesButton(){
  jQuery("#toggleEveningClasses").click(function(){
    jQuery(".eveningClass").toggle();
      jQuery(this).text(jQuery(this).text() == 'hide evening classes' ? 'show evening classes' : 'hide evening classes');
  })
}
function initializeToggleLunchClassesButton(){
  jQuery("#toggleLunchClasses").click(function(){
    jQuery(".lunchClass").toggle();
      jQuery(this).text(jQuery(this).text() == 'hide lunch classes' ? 'show lunch classes' : 'hide lunch classes');
  })
}

function initializeRemoveButton(){
  jQuery("#removeAllSelected").click(function(){
    var selectedLis=jQuery("li.ui-selected");
    collectRemovedDates(selectedLis);
    jQuery.each(selectedLis,function(){

        jQuery(this).remove();
    });
    //jQuery(".ui-selected").remove();
    jQuery(".closeThisButton").trigger("click");

  })
}

function collectRemovedDates(selectedLis){
  if(jQuery.isEmptyObject(jQuery("#calendar").data().removedDates)){
    var removedDatesObject = {};
  }
  else{
    removedDatesObject = jQuery("#calendar").data().removedDates;
  }
  jQuery(selectedLis).each(function(){
    var thisMetaID=jQuery(this).data().metaID;
    if (typeof removedDatesObject[thisMetaID] == 'undefined') {
        removedDatesObject[thisMetaID]=[];
    }

    removedDatesObject[thisMetaID].push(jQuery(this).data().date);
  })
  jQuery("#calendar").data().removedDates=removedDatesObject;
}

//create array to send via json to save to db.
//array key should be the metaID
//this will be an array of arrays with the date and starting time first and the date and ending time seconds
//format: [date-startingTime,date-endingTime]
//this is turned of for now pending figuring out a way to collect duplicated dates that does not involve rewriting every single class recurring dates schedule
//it could still be done in one button that runs through the different save scenarios
function collectRemainingDates(){
  var classesAndDatesObject={};
  jQuery(".dayClasses li").each(function(){
    //console.log(jQuery(this).data().date);
      var thisMetaID=jQuery(this).data().metaID;

      if (typeof classesAndDatesObject[thisMetaID] == 'undefined') {
          classesAndDatesObject[thisMetaID]=[];
      }
      classesAndDatesObject[thisMetaID].push(jQuery(this).data().date);
  });

    writeDatesToDatabase(classesAndDatesObject);
    return classesAndDatesObject;
}
function removeDatesFromDB (){
    jQuery.each(jQuery("#calendar").data().removedDates,function(key,dates){
      var stringRequest = "removeDatesFromDB.php?key="+key+"&dates="+JSON.stringify(dates);
      $.getJSON(stringRequest, function (){

      });
    })
}

function writeDatesToDatabase (){//deprecated
    jQuery.each(jQuery("#calendar").data().removedDates,function(key,dates){
      var stringRequest = "saveDatesToDB.php?key="+key+"&dates="+JSON.stringify(dates);
      console.log(stringRequest);
    })

return;
    jQuery.each(classesAndDatesObject,function(key,dates){
        var stringRequest = "saveDatesToDB.php?key="+key+"&dates="+JSON.stringify(dates);
        console.log(stringRequest);
        $.getJSON(stringRequest, function (){

        });

    })
    return;


}


function loadClasses(response) {

    jQuery.each(response, function(I,V){
        jQuery.each(V.dates, function(i,date){
          var timestamp= date[0];
          var dateObj = new Date(timestamp * 1000);
          var utcString = dateObj.toUTCString();//makes sure that the date and time are used as intended, they were saved as UTC so that's what we need to use
          var hoursInSeconds=dateObj.getUTCHours()*3600;//how many seconds per hour
          var minutesInSeconds=dateObj.getUTCMinutes()*60;
          var timeStampAt12AM=timestamp-hoursInSeconds;//subtract the number of seconds from the Unix timestamp stored in the database to get to 12AM that day
          //see if the date stored includes starting times not on the hour but half hour for example. 10:30AM
          //if that's the case subtract that from the timestamp as well
          if(minutesInSeconds>0){
            timeStampAt12AM=timeStampAt12AM-minutesInSeconds;
          }
          var thisDay=jQuery("#"+timeStampAt12AM);
          var thisClass=jQuery("<li/>").text(V.post_subtitle)
              .on("click", function(event){
                  classClicked(this);
                  event.stopPropagation();
                })
                .data("metaID",V.meta_id)
                .data("date",date);
          var classTime=dateObj.getUTCHours();
          if(classTime>12){
            thisClass.addClass("eveningClass");
          }
          else{
            thisClass.addClass("lunchClass");
          }
          thisDay.find(".dayClasses").append(thisClass);
        })

    })
}
function classClicked(e){
  jQuery(e).toggleClass("selected");
}

function selectRowOrColumn(a){
  jQuery(a).find("ul").addClass("selected");
}
function getBookedClasses(){
        var stringRequest="getBookedClasses_final.php";
	   $.getJSON(stringRequest, function (response){
            loadClasses(response);

	   })
}

//initialize actions button
function initializeActionsButton(){
  jQuery("#calendarActions").click(function(){
     jQuery("#calendarActionsMenu").css("display","flex");
  })
}


function compare(a,b) {
    return a==b;
}

function createUI() {
    jQuery.each(createDecade(),function(I,year){
        var yearHeadline=jQuery("<h1/>").text(year.year).data("year",year.year);
        jQuery("#calendar").append(yearHeadline);
        jQuery.each(year.months, function(i,month){
            var monthName=jQuery("<h2/>").text(month.monthName).addClass(month.monthName);
            //create days ui
            var days=jQuery("<div/>").addClass("month");
            jQuery.each(month.daysOfTheMonth,function(j,day){
                var utcDate1 = new Date(Date.UTC(year.year, month.monthNumber-1, day.dayOfTheMonthNumber, 0, 0, 0));//for Date.UTC, months are an array apparently so they start at 0;
                var thisDate=utcDate1.toUTCString();
                var thisEpochDate=utcDate1.getTime()/1000;
                if (j==0) {//we reached a new month
                    var counter=0;
                    while (counter<month.firstDayOfTheMonth) {//create the requisite number of empty days before the 1st day of the month, in other wrods the stragglers from the previous month
                        jQuery("<div/>").addClass("day").prependTo(days);
                        counter++;
                    }
                }

                jQuery("<div/>")
                  .text(day.dayOfTheMonthNumber)
                  .addClass("day")
                  .attr("id",thisEpochDate)
                  .appendTo(days)
                  .append("<ul class='dayClasses'></ul>")
                  .on("click",function(){
                      jQuery(this).find("li").toggleClass("selected");
                      });
            });
            var currentMonth = jQuery("<div/>").append(monthName,days).addClass()
              .selectable({
                filter:"li",
                });
            jQuery("#calendar").append(currentMonth);
        })

    });

}


function createDecade() {
    //years of the decade, for now
    //days of the week are set as an array to prevent ordering problems. They start with index 0.
    var year2019={year:2019,leap:false,firstDayOfTheYear:2,dayCount:365};
    var year2020={year:2020,leap:true,firstDayOfTheYear:3, dayCount:366};
    var year2021={year:2021,leap:false,firstDayOfTheYear:5, dayCount:365};
    var year2022={year:2022,leap:false,firstDayOfTheYear:6, dayCount:365};
    var year2023={year:2023,leap:false,firstDayOfTheYear:0, dayCount:365};
    var year2024={year:2024,leap:true, firstDayOfTheYear:1, dayCount:366};
    var year2025={year:2025,leap:false, firstDayOfTheYear:3, dayCount:365};
    var year2026={year:2026,leap:false, firstDayOfTheYear:4, dayCount:365};
    var year2027={year:2027,leap:false, firstDayOfTheYear:5,dayCount:365};
    var year2028={year:2028,leap:true, firstDayOfTheYear:6,dayCount:366};
    var decade=[year2020];//defined as an array to keep the order when browser parses
    //add months to every year
    jQuery.each(decade,function(i,year){
       year.months=createMonths(year);
    });
    return decade;
}
 /*createDaysOfTheYear()
 *creates a day of the year for every possible day
 *changes in leap years. Accomplished through passing the argument of which year is being populated.
 *this not yet implemented
 *returns an array with every day of the year as an object
 *an array is chosen to prevent ordering problems when displaying the calendar
 *can be used alone or in a loop from the decades function
*/
function createDaysOfTheMonth(year, monthDayCount) {
    var daysOfTheMonth=[];
    var firstDayOfTheYear=year.firstDayOfTheYear;
    var dayOfTheWeek=firstDayOfTheYear;//the first day of the week is also the first day created.
    var sentinel=0;
    while (sentinel<=monthDayCount-1) {
        var day={};
        day={'dayOfTheMonthNumber':sentinel+1,"dayOfTheWeek":createDaysOfTheWeek()[dayOfTheWeek].dayOfTheWeekNumber,"shortName":createDaysOfTheWeek()[dayOfTheWeek].shortName};
        daysOfTheMonth.push(day);
        sentinel++;
        if (dayOfTheWeek<6) {
            dayOfTheWeek++;
        }
        else if (dayOfTheWeek==6) {
            dayOfTheWeek=0;
        }
    }
    return daysOfTheMonth;
}

/*
 *returns an array with each of the seven days of the week. First day of the week is Sunday, position 0.
 *No arguments are needed
 *dependencies for create days of the month
*/
function createDaysOfTheWeek() {
    var Sunday={dayOfTheWeekNumber:1,shortName:"Sun"};
    var Monday={dayOfTheWeekNumber:2,shortName:"Mon"};
    var Tuesday={dayOfTheWeekNumber:3, shortName:"Tue"}
    var Wednesday={dayOfTheWeekNumber:4, shortName:"Wed"};
    var Thursday={dayOfTheWeekNumber:5, shortName:"Thu"};
    var Friday = {dayOfTheWeekNumber:6,shortName:"Fri"};
    var Saturday = {dayOfTheWeekNumber:7, shortName:"Sat"}
    var daysOfTheWeek = [Sunday, Monday,Tuesday,Wednesday,Thursday,Friday,Saturday]//2019 started on a Tuesday so we are starting the decade on that day of the week
    return daysOfTheWeek;
}
function createFirstDayOfTheMonth(year,month) {//I don't think this is being used
    //based on the first weekday of the year, add and subtract totals from the previous month.
    //console.log(month.monthName);
    //console.log(year.firstDayOfTheYear);
    //var firstDayOfTheMonth="";
    var currentMonthArrayIndex=month.monthNumber-1;
    //console.log(currentMonthArrayIndex);
    var previousMonthArrayIndex=currentMonthArrayIndex-1;
}
/*returns an object with every month of the year with day counts
 *dependency for creating days of the month
*/
function createMonths(year) {
    var January ={monthNumber:"1",monthName:"January",dayCount:"31",daysOfTheMonth:createDaysOfTheMonth(year,31)};
        January.firstDayOfTheMonth=year.firstDayOfTheYear;
    var February ={monthNumber:"2",monthName:"February",dayCount:"28", daysOfTheMonth:createDaysOfTheMonth(year, 28)};
        February.firstDayOfTheMonth=January.firstDayOfTheMonth+31-28;
    var March ={monthNumber:"3",monthName:"March",dayCount:"31", daysOfTheMonth:createDaysOfTheMonth(year, 31)};
        March.firstDayOfTheMonth=February.firstDayOfTheMonth;
    var April ={monthNumber:"4",monthName:"April",dayCount:"30", daysOfTheMonth:createDaysOfTheMonth(year,30)};
        April.firstDayOfTheMonth=March.firstDayOfTheMonth+31-28;
    var May ={monthNumber:"5",monthName:"May",dayCount:"31", daysOfTheMonth:createDaysOfTheMonth(year,31)};
        May.firstDayOfTheMonth=April.firstDayOfTheMonth+30-28;
    var June ={monthNumber:"6",monthName:"June",dayCount:"30", daysOfTheMonth:createDaysOfTheMonth(year,30)};
        June.firstDayOfTheMonth=May.firstDayOfTheMonth+31-28;
    var July ={monthNumber:"7",monthName:"July",dayCount:"31", daysOfTheMonth:createDaysOfTheMonth(year,31)};
        July.firstDayOfTheMonth=June.firstDayOfTheMonth+30-28;
    var August ={monthNumber:"8",monthName:"August",dayCount:"31", daysOfTheMonth:createDaysOfTheMonth(year,31)};
        August.firstDayOfTheMonth=July.firstDayOfTheMonth+31-28;
    var September ={monthNumber:"9",monthName:"September",dayCount:"30", daysOfTheMonth:createDaysOfTheMonth(year,30)};
        September.firstDayOfTheMonth=August.firstDayOfTheMonth+31-28;
    var October ={monthNumber:"10",monthName:"October",dayCount:"31", daysOfTheMonth:createDaysOfTheMonth(year,31)};
        October.firstDayOfTheMonth=September.firstDayOfTheMonth+30-28;
    var November ={monthNumber:"11",monthName:"November",dayCount:"30", daysOfTheMonth:createDaysOfTheMonth(year,30)};
        November.firstDayOfTheMonth=October.firstDayOfTheMonth+31-28;
    var December ={monthNumber:"12",monthName:"December",dayCount:"31", daysOfTheMonth:createDaysOfTheMonth(year,31)};
    December.firstDayOfTheMonth=November.firstDayOfTheMonth+30-28;
    var monthsObject = [January, February, March,April,May,June,July,August,September,October,November,December];
    if (year.leap==true) {
        jQuery.each(monthsObject, function(i,month){
           February.dayCount="29";
           February.daysOfTheMonth=createDaysOfTheMonth(year, 29);
            if (i>1) {//after February
             month.firstDayOfTheMonth=month.firstDayOfTheMonth+1;
            }
        })
    }
    //now let's fix the first day of the month when the calculation  in the above function yields a number over 6, the limit for 7 days on a 0 to 6 count
    jQuery.each(monthsObject, function(i,month){
        if(month.firstDayOfTheMonth>6){
            month.firstDayOfTheMonth=  month.firstDayOfTheMonth%7;//modulus yields the remainder which is the proper number to use
        }
    });
    return monthsObject;
}
