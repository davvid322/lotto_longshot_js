/*
Javascript for the Lotto Longshot lottery simulation application.
Created by: David Young, April 2020
*/

// Global declarations
const MINBALL = 1;
const MAXBALL = 49;
const MAXPICKS = 6;
const POSSIBLENUMRIGHT = 7;
const PAYOFFRATES = [0, 0, 3, 10, 80, 2500, 9000000];
const WONMESSAGE = ["", "", " $", " $$$", " $$$$ Nice!", " $$$$$ Cowabunga!",
                   "====> You are a millionaire!!"]
const COSTPERTICKET = 3;

// Variables for running the simulations
var balls = new Array(MAXBALL);
var myPicks = new Array(MAXPICKS);  // Index values of picks, not values //
var numGames = 0;
var numRight = 0;
var accumWins = new Array(MAXPICKS);
var accumPayoff = new Array(MAXPICKS);
var showDetail = false;

// Variables for producing the results report
var reportLines = new Array();
var reportBlock = "";
var oneLine = "";
var moneyFormat = new Intl.NumberFormat('en-US', { style: 'currency',
      currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0});
var pctFormat = new Intl.NumberFormat('en-US', { style: 'percent',
      minimumFractionDigits: 2, maximumFractionDigits: 2});
var intFormat = new Intl.NumberFormat('en-US', { style: 'decimal',
      minimumFractionDigits: 0, maximumFractionDigits: 0});
var ballFormat = new Intl.NumberFormat('en-US', { style: 'decimal',
      minimumIntegerDigits: 2, minimumFractionDigits: 0, maximumFractionDigits: 0});

// Pick random balls within range and load into the balls array
// Note that the array is indexed from 0 to MAXBALL - 1
function pickBalls() {
  var nballs = 0;
  var pick = 0;
  var showpick = "";

  for (var i = 0; i < MAXBALL; i++) {
    balls [i] = false;
  }
  while (nballs < MAXPICKS) {
    pick = Math.floor(Math.random() * MAXBALL); // index from 0 to MAXBALL-1
    if (!balls[pick]) {
      balls[pick] = true;
      if (showDetail) {
        showpick = ballFormat.format(pick + 1);  // The displayable pick, not the index
        oneLine = oneLine + showpick + " ";
      }
      nballs++;
    }  // if
  }  // while
}  // pickballs

// Count the number of balls which match my picks
function countNumRight() {
  numRight= 0;
  for (i = 0; i < MAXPICKS; i++) {
    if (balls[myPicks[i]]) {
      numRight++;
    } // if
  } // for
} // countNumRight

// Quick Pick action
function doQuickPick() {
  pickBalls();
  var pickNum = 0;
  for (i = 0; i < MAXBALL; i++) {
    if (balls[i]) {
      myPicks[pickNum] = i;
      pickNum++;
    } // if
  }  //  for
// The displayable pick nunumber is the array index + 1, since the
// array of balls is indexed starting at 0, not 1
  document.getElementById("picks1").value = myPicks[0] + 1;
  document.getElementById("picks2").value = myPicks[1] + 1;
  document.getElementById("picks3").value = myPicks[2] + 1;
  document.getElementById("picks4").value = myPicks[3] + 1;
  document.getElementById("picks5").value = myPicks[4] + 1;
  document.getElementById("picks6").value = myPicks[5] + 1;
} // doQuickPick

// Function to validate the parameters from the form, and if valid run the simulations.
function doRunSim () {
  // Validate all input paramters
  document.getElementById("errmsg").hidden = true;
  myPicks[0] = document.getElementById("picks1").value - 1;
  myPicks[1] = document.getElementById("picks2").value - 1;
  myPicks[2] = document.getElementById("picks3").value - 1;
  myPicks[3] = document.getElementById("picks4").value - 1;
  myPicks[4] = document.getElementById("picks5").value - 1;
  myPicks[5] = document.getElementById("picks6").value - 1;
  numGames = document.getElementById("numgames").value;
  showDetail = document.getElementById("showdetail").checked;
  if (numGames > 1000) {  // Don't allow detail reporting if too many games
    showDetail = false;
    document.getElementById("showsummary").checked = true;
  }
  for (var i = 0; i < MAXPICKS; i++) {
    if ((myPicks[i] < 0) || (myPicks[i] > (MAXBALL - 1))) {
      errMessage = "Your numbers must all be between 1 and " + MAXBALL;
      document.getElementById("errmsg").hidden = false;
      document.getElementById("errmsg").value = errMessage;
      return 0;
    } // if
    for (var j = 0; j < MAXPICKS; j++) {
      if ((i != j) && (myPicks[i] == myPicks[j])) {
        errMessage = "Duplicate number " + (myPicks[i] + 1) + " entered";
        document.getElementById("errmsg").hidden = false;
        document.getElementById("errmsg").value = errMessage;
        return 0;
      } // if
    } // for
  } // for
  if (numGames < 1) {
    errMessage = "Number of games must be greater than zero";
    document.getElementById("errmsg").hidden = false;
    document.getElementById("errmsg").value = errMessage;
    return 0;
  } // if

  // Run the simulations

  // initialize the stats
  for (var i = 0; i < POSSIBLENUMRIGHT; i++) {
    accumWins[i] = 0;
    accumPayoff[i] = 0;
  }
  // Clear out any old results
  let sect = document.getElementById("resultsarea");
  while (sect.firstChild) {
    sect.removeChild(sect.firstChild);
  }
  // Run through all of the games
  for (nthGame = 1; nthGame <= numGames; nthGame++) {
    if (showDetail) {
      oneLine = "Game: " + intFormat.format(nthGame) + "   Drawn: ";
    }
    pickBalls();
    countNumRight();
    if (showDetail) {
      oneLine = oneLine + "  --> Got " + numRight + " right " + WONMESSAGE[numRight];
      let sect = document.getElementById("resultsarea");
      let para = document.createElement("pre");
      para.textContent = oneLine;
      sect.appendChild(para);
    }
    accumWins[numRight]++;
  } // for

  // Produce the summary report
  reportLines.length = 0;
  if (showDetail) {
    oneLine = "------------------------------------------------------";
    reportLines.push(oneLine);
  } // if
  oneLine = "Completed " + intFormat.format(numGames) + " games";
  reportLines.push(oneLine);
  var totalPayoff = 0;
  for (var i = 0; i < POSSIBLENUMRIGHT; i++) {
    accumPayoff[i] = accumWins[i] * PAYOFFRATES [i];
    totalPayoff = totalPayoff + accumPayoff[i];
    var pctGames = (accumWins[i] / numGames);
    oneLine = "Got " + i + " right:  " + intFormat.format(accumWins[i]) +
              " times = " + pctFormat.format(pctGames) +
              "   Payoff = " + moneyFormat.format(accumPayoff[i]);
    reportLines.push(oneLine);
  } // for
  var totalCost = numGames * COSTPERTICKET;
  var totalProfit = totalPayoff - totalCost;
  oneLine = "Total cost of tickets : " + moneyFormat.format(totalCost);
  reportLines.push(oneLine);
  oneLine = "Total money won       : " + moneyFormat.format(totalPayoff);
  reportLines.push(oneLine);
  oneLine = "Total profit / loss   : " + moneyFormat.format(totalProfit);
  reportLines.push(oneLine);
  oneLine = "Percent profit / loss : " + pctFormat.format(totalProfit / totalCost);
  reportLines.push(oneLine);
  for (i = 0; i < reportLines.length; i++) {
    let sect = document.getElementById("resultsarea");
    let para = document.createElement("pre");
    para.textContent = reportLines[i];
    sect.appendChild(para);
  } // for
} // doRunSim
