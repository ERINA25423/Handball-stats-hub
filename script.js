let currentTeam = "MY TEAM";
let currentHalf = 1;
let seconds = 0;
let timerRunning = false;
let timerInterval = null;

let selectedPosition = "";
let selectedCourse = "";
let selectedShotType = "";
let selectedResult = "";
let selectedEvent = "";

let eventHistory = [];


/* ========================================
   ELEMENTS
======================================== */

const timerDisplay = document.getElementById("timer");
const timerToggle = document.getElementById("timerToggle");
const halfDisplay = document.getElementById("half");

const myTeamButton = document.getElementById("myTeam");
const opponentButton = document.getElementById("opponent");

const homeScreen = document.getElementById("homeScreen");
const matchSetup = document.getElementById("matchSetup");
const gameScreen = document.getElementById("gameScreen");

const newMatchButton = document.getElementById("newMatchButton");
const startMatchButton = document.getElementById("startMatch");
const noMatchStartedButton =
  document.getElementById("noMatchStartedButton");

const saveEventButton = document.getElementById("saveEvent");
const undoButton = document.getElementById("undo");
const undoQuickButton = document.getElementById("undoQuick");

const halfToggle = document.getElementById("halfToggle");
const endMatchButton = document.getElementById("endMatchButton");

const otherToggle = document.getElementById("otherToggle");
const otherPanel = document.getElementById("otherPanel");

const historyToggle = document.getElementById("historyToggle");
const historyPanel = document.getElementById("historyPanel");

const matchHistoryButton =
  document.getElementById("matchHistoryButton");

const matchHistoryScreen =
  document.getElementById("matchHistoryScreen");

const matchHistoryList =
  document.getElementById("matchHistoryList");

const backToHomeFromHistory =
  document.getElementById("backToHomeFromHistory");

const analysisScreen =
  document.getElementById("analysisScreen");

const backToHistory =
  document.getElementById("backToHistory");

const analysisMatchInfo =
  document.getElementById("analysisMatchInfo");

const overviewContent =
  document.getElementById("overviewContent");


/* ========================================
   TIMER
======================================== */

function updateTimer() {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  timerDisplay.textContent =
    String(min).padStart(2, "0") +
    ":" +
    String(sec).padStart(2, "0");
}


timerToggle.addEventListener("click", () => {
  timerRunning = !timerRunning;

  if (timerRunning) {
    timerToggle.textContent = "STOP";

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      seconds++;
      updateTimer();
    }, 1000);
  } else {
    timerToggle.textContent = "START";
    clearInterval(timerInterval);
  }
});


document.querySelectorAll("[data-time]").forEach((button) => {
  button.addEventListener("click", () => {
    seconds += Number(button.dataset.time);

    if (seconds < 0) {
      seconds = 0;
    }

    updateTimer();
  });
});


/* ========================================
   HALF
======================================== */

halfToggle.addEventListener("click", () => {
  currentHalf = currentHalf === 1 ? 2 : 1;

  halfDisplay.textContent =
    currentHalf === 1
      ? "1st Half"
      : "2nd Half";
});


/* ========================================
   TEAM
======================================== */

myTeamButton.addEventListener("click", () => {
  currentTeam = "MY TEAM";

  myTeamButton.classList.add("active");
  opponentButton.classList.remove("active");
});


opponentButton.addEventListener("click", () => {
  currentTeam = "OPPONENT";

  opponentButton.classList.add("active");
  myTeamButton.classList.remove("active");
});


/* ========================================
   POSITION
======================================== */

document
  .querySelectorAll(".player-position")
  .forEach((button) => {

    const numberInput =
      button.querySelector(".jersey-number");

    numberInput.addEventListener("click", (event) => {
      event.stopPropagation();
      numberInput.select();
    });

    numberInput.addEventListener("input", (event) => {
      event.stopPropagation();

      if (numberInput.value.length > 2) {
        numberInput.value =
          numberInput.value.slice(0, 2);
      }
    });

    button.addEventListener("click", () => {

      document
        .querySelectorAll(".player-position")
        .forEach((btn) => {
          btn.classList.remove("selected");
          btn.classList.remove("active");
        });

      button.classList.add("selected");
      button.classList.add("active");

      selectedPosition =
        button.dataset.position || "";
    });

  });


/* ========================================
   GENERIC SINGLE SELECTION
======================================== */

function setupSingleSelection(selector, callback) {
  const buttons =
    document.querySelectorAll(selector);

  buttons.forEach((button) => {

    button.addEventListener("click", () => {

      buttons.forEach((b) => {
        b.classList.remove("active");
      });

      button.classList.add("active");

      callback(button);
    });

  });
}


/* ========================================
   SHOT COURSE
======================================== */

setupSingleSelection(
  "#goalGrid button",
  (button) => {
    selectedCourse =
      button.dataset.course || "";
  }
);


/* ========================================
   SHOT TYPE
======================================== */

setupSingleSelection(
  ".shot-types button",
  (button) => {
    selectedShotType =
      button.textContent.trim();
  }
);


/* ========================================
   RESULT
======================================== */

setupSingleSelection(
  ".results button",
  (button) => {
    selectedResult =
      button.dataset.result || "";
  }
);


/* ========================================
   OTHER EVENTS
======================================== */

setupSingleSelection(
  ".events button",
  (button) => {
    selectedEvent =
      button.dataset.event || "";
  }
);


/* ========================================
   OTHER POPUP
======================================== */

otherToggle.addEventListener("click", (event) => {
  event.stopPropagation();

  otherPanel.hidden = !otherPanel.hidden;

  if (!historyPanel.hidden) {
    historyPanel.hidden = true;
  }
});


/* ========================================
   HISTORY POPUP
======================================== */

historyToggle.addEventListener("click", (event) => {
  event.stopPropagation();

  historyPanel.hidden = !historyPanel.hidden;

  if (!otherPanel.hidden) {
    otherPanel.hidden = true;
  }

  if (!historyPanel.hidden) {
    renderHistory();
  }
});


/* ========================================
   CLOSE POPUPS WHEN TAPPING OUTSIDE
======================================== */

document.addEventListener("click", (event) => {

  if (
    !otherPanel.hidden &&
    !otherPanel.contains(event.target) &&
    event.target !== otherToggle
  ) {
    otherPanel.hidden = true;
  }

  if (
    !historyPanel.hidden &&
    !historyPanel.contains(event.target) &&
    event.target !== historyToggle
  ) {
    historyPanel.hidden = true;
  }

});


/* ========================================
   SAVE EVENT
======================================== */

saveEventButton.addEventListener("click", () => {
  saveEvent();
});


function saveEvent() {

  const selectedPlayerButton =
    document.querySelector(
      `.player-position[data-position="${selectedPosition}"]`
    );

  const playerNumber =
    selectedPlayerButton
      ?.querySelector(".jersey-number")
      ?.value || "?";


  /*
    RESULTが選択されていればSHOT。
    OTHERイベントが選択されていればOTHER。
  */

  const eventType =
    selectedEvent && !selectedResult
      ? "OTHER"
      : "SHOT";


  const event = {

    type: eventType,

    team: currentTeam,

    half: currentHalf,

    time: timerDisplay.textContent,

    playerNumber: playerNumber,

    goalkeeperNumber:
      currentTeam === "OPPONENT"
        ? document.getElementById("goalkeeperNumber")
            ?.value || null
        : null,

    position:
      selectedPosition || null,

    shotType:
      selectedShotType || null,

    course:
      selectedCourse || null,

    result:
      selectedResult || null,

    event:
      selectedEvent || null,

    timestamp:
      Date.now()

  };


  eventHistory.push(event);

  saveToDevice();
  renderHistory();

  resetShotSelection();
  resetOtherSelection();

  otherPanel.hidden = true;
}


/* ========================================
   RESET SHOT SELECTION
======================================== */

function resetShotSelection() {

  selectedCourse = "";
  selectedShotType = "";
  selectedResult = "";

  document
    .querySelectorAll(
      "#goalGrid button, " +
      ".shot-types button, " +
      ".results button"
    )
    .forEach((button) => {
      button.classList.remove("active");
    });

}


/* ========================================
   RESET OTHER
======================================== */

function resetOtherSelection() {

  selectedEvent = "";

  document
    .querySelectorAll(".events button")
    .forEach((button) => {
      button.classList.remove("active");
    });

}


/* ========================================
   EVENT HISTORY
======================================== */

function renderHistory() {

  const history =
    document.getElementById("history");

  history.innerHTML = "";


  const recentEvents =
    [...eventHistory]
      .reverse()
      .slice(0, 20);


  if (recentEvents.length === 0) {

    history.innerHTML =
      `<div class="history-item">
        NO EVENTS
      </div>`;

    return;
  }


  recentEvents.forEach((event) => {

    const item =
      document.createElement("div");

    item.className = "history-item";


    if (event.type === "SHOT") {

      item.textContent =
        `${event.time} | ` +
        `${event.team} | ` +
        `#${event.playerNumber} ` +
        `${event.position || ""} | ` +
        `${event.shotType || ""} | ` +
        `${event.course || ""} | ` +
        `${event.result || ""}`;

    } else {

      item.textContent =
        `${event.time} | ` +
        `${event.team} | ` +
        `#${event.playerNumber} ` +
        `${event.position || ""} | ` +
        `${event.event || ""}`;

    }

    history.appendChild(item);

  });

}


/* ========================================
   UNDO
======================================== */

function undoLastEvent() {

  if (eventHistory.length === 0) {
    return;
  }

  eventHistory.pop();

  saveToDevice();
  renderHistory();
}


undoButton.addEventListener(
  "click",
  undoLastEvent
);


undoQuickButton.addEventListener(
  "click",
  undoLastEvent
);


/* ========================================
   LOCAL STORAGE
======================================== */

function saveToDevice() {

  localStorage.setItem(
    "handballStatsEvents",
    JSON.stringify(eventHistory)
  );

}


function loadFromDevice() {

  const saved =
    localStorage.getItem(
      "handballStatsEvents"
    );

  if (!saved) {
    return;
  }

  try {

    eventHistory =
      JSON.parse(saved);

    if (!Array.isArray(eventHistory)) {
      eventHistory = [];
    }

    renderHistory();

  } catch {

    eventHistory = [];

  }

}


/* ========================================
   HOME → MATCH SETUP
======================================== */

newMatchButton.addEventListener("click", () => {

  homeScreen.hidden = true;
  matchSetup.hidden = false;

});


/* ========================================
   MATCH SETUP → HOME
======================================== */

noMatchStartedButton.addEventListener(
  "click",
  () => {

    matchSetup.hidden = true;
    homeScreen.hidden = false;

  }
);


/* ========================================
   START MATCH
======================================== */

startMatchButton.addEventListener("click", () => {

  /*
    新しい試合なので、
    一時的なイベント履歴を初期化
  */

  eventHistory = [];

  saveToDevice();

  seconds = 0;
  currentHalf = 1;
  currentTeam = "MY TEAM";

  timerRunning = false;
  clearInterval(timerInterval);

  updateTimer();

  timerToggle.textContent = "START";
  halfDisplay.textContent = "1st Half";

  myTeamButton.classList.add("active");
  opponentButton.classList.remove("active");

  resetShotSelection();
  resetOtherSelection();

  matchSetup.hidden = true;
  gameScreen.hidden = false;

});


/* ========================================
   END MATCH
======================================== */

endMatchButton.addEventListener("click", () => {

  const confirmed = confirm(
    "END MATCH?\n\n試合を終了して保存しますか？"
  );

  if (!confirmed) {
    return;
  }


  clearInterval(timerInterval);

  timerRunning = false;
  timerToggle.textContent = "START";


  const completedMatch = {

    id: Date.now(),

    date:
      document.getElementById("matchDate")
        ?.value || "",

    myTeam:
      document.getElementById("myTeamName")
        ?.value || "MY TEAM",

    opponent:
      document.getElementById("opponentName")
        ?.value || "OPPONENT",

    events:
      [...eventHistory],

    analysis: {

      match:
        analyzeMatch(eventHistory),

      goalkeepers:
        analyzeGoalkeepers(eventHistory)

    },

    savedAt:
      new Date().toISOString()

  };

   // ログイン中ならFirebaseにも保存
if (window.saveMatchToCloud) {
  window.saveMatchToCloud(completedMatch);
}

  const savedMatches =
    JSON.parse(
      localStorage.getItem(
        "handballMatches"
      )
    ) || [];


  savedMatches.push(completedMatch);


  localStorage.setItem(
    "handballMatches",
    JSON.stringify(savedMatches)
  );


  /*
    保存後、一時イベントを消す
  */

  eventHistory = [];
  saveToDevice();


  gameScreen.hidden = true;

  analysisScreen.hidden = false;

  renderAnalysis(completedMatch);

});


/* ========================================
   ANALYTICS HELPERS
======================================== */

function calcRate(success, total) {

  if (!total) {
    return 0;
  }

  return (
    Math.round(
      (success / total) * 1000
    ) / 10
  );

}


function isShot(event) {

  return event.type === "SHOT";

}


function isGoal(event) {

  if (!isShot(event)) {
    return false;
  }

  const result =
    String(
      event.result || ""
    ).toUpperCase();

  return (
    result === "GOAL" ||
    result === "SCORE" ||
    result === "SUCCESS"
  );

}


function isMistake(event) {

  const value =
    String(
      event.event || ""
    ).toUpperCase();

  return (
    value === "TURNOVER" ||
    value === "ERROR"
  );

}


function isSave(event) {

  const result =
    String(
      event.result || ""
    ).toUpperCase();

  return (
    result === "SAVE" ||
    result === "SAVED"
  );

}


/* ========================================
   COURSE ANALYSIS
======================================== */

function analyzeCourses(events) {

  const courses = {};


  events
    .filter(isShot)
    .forEach((event) => {

      const course =
        event.course || "UNKNOWN";


      if (!courses[course]) {

        courses[course] = {
          attempts: 0,
          goals: 0,
          rate: 0
        };

      }


      courses[course].attempts++;


      if (isGoal(event)) {
        courses[course].goals++;
      }

    });


  Object.keys(courses)
    .forEach((course) => {

      courses[course].rate =
        calcRate(
          courses[course].goals,
          courses[course].attempts
        );

    });


  return courses;

}


/* ========================================
   SHOT TYPE ANALYSIS
======================================== */

function analyzeShotTypes(events) {

  const types = {};


  events
    .filter(isShot)
    .forEach((event) => {

      const type =
        event.shotType || "UNKNOWN";


      if (!types[type]) {

        types[type] = {
          attempts: 0,
          goals: 0,
          rate: 0
        };

      }


      types[type].attempts++;


      if (isGoal(event)) {
        types[type].goals++;
      }

    });


  Object.keys(types)
    .forEach((type) => {

      types[type].rate =
        calcRate(
          types[type].goals,
          types[type].attempts
        );

    });


  return types;

}


/* ========================================
   PLAYER ANALYSIS
======================================== */

function analyzePlayers(events) {

  const players = {};


  events.forEach((event) => {

    const number =
      event.playerNumber;


    if (
      number === null ||
      number === undefined ||
      number === "" ||
      number === "?"
    ) {
      return;
    }


    if (!players[number]) {

      players[number] = {

        playerNumber: number,

        shots: 0,
        goals: 0,
        shotRate: 0,

        mistakes: 0,

        courses: {},
        shotTypes: {},

        bestCourse: null,
        worstCourse: null

      };

    }


    const player =
      players[number];


    if (isShot(event)) {

      player.shots++;

      if (isGoal(event)) {
        player.goals++;
      }

    }


    if (isMistake(event)) {
      player.mistakes++;
    }

  });


  Object.keys(players)
    .forEach((number) => {

      const playerEvents =
        events.filter(
          (event) =>
            String(event.playerNumber) ===
            String(number)
        );


      const player =
        players[number];


      player.shotRate =
        calcRate(
          player.goals,
          player.shots
        );


      player.courses =
        analyzeCourses(playerEvents);


      player.shotTypes =
        analyzeShotTypes(playerEvents);


      const courseList =
        Object.entries(
          player.courses
        ).filter(
          ([, data]) =>
            data.attempts > 0
        );


      if (courseList.length > 0) {

        const sorted =
          [...courseList].sort(
            (a, b) =>
              b[1].rate -
              a[1].rate
          );


        player.bestCourse =
          sorted[0][0];


        player.worstCourse =
          sorted[
            sorted.length - 1
          ][0];

      }

    });


  return players;

}


/* ========================================
   TEAM ANALYSIS
======================================== */

function analyzeTeam(events) {

  const shots =
    events.filter(isShot);

  const goals =
    shots.filter(isGoal);

  const mistakes =
    events.filter(isMistake);


  const fastBreakShots =
    shots.filter((event) =>

      String(
        event.shotType || ""
      )
        .toUpperCase()
        .includes("FAST")

    );


  const fastBreakGoals =
    fastBreakShots.filter(isGoal);


  const sevenMeterShots =
    shots.filter((event) =>

      String(
        event.shotType || ""
      )
        .toUpperCase()
        .includes("7M")

    );


  const setShots =
    shots.filter((event) => {

      const type =
        String(
          event.shotType || ""
        ).toUpperCase();

      return (
        !type.includes("FAST") &&
        !type.includes("7M")
      );

    });


  const setGoals =
    setShots.filter(isGoal);


  const attacks =
    shots.length +
    mistakes.length;


  return {

    totalShots:
      shots.length,

    totalGoals:
      goals.length,

    shotRate:
      calcRate(
        goals.length,
        shots.length
      ),

    setAttempts:
      setShots.length,

    setGoals:
      setGoals.length,

    setSuccessRate:
      calcRate(
        setGoals.length,
        setShots.length
      ),

    fastBreakAttempts:
      fastBreakShots.length,

    fastBreakGoals:
      fastBreakGoals.length,

    fastBreakSuccessRate:
      calcRate(
        fastBreakGoals.length,
        fastBreakShots.length
      ),

    sevenMeterAttempts:
      sevenMeterShots.length,

    attackSuccessRate:
      calcRate(
        goals.length,
        attacks
      ),

    mistakes:
      mistakes.length,

    mistakeRate:
      calcRate(
        mistakes.length,
        attacks
      ),

    courses:
      analyzeCourses(events),

    shotTypes:
      analyzeShotTypes(events),

    players:
      analyzePlayers(events)

  };

}


/* ========================================
   HALF ANALYSIS
======================================== */

function analyzeByHalf(events) {

  const firstHalf =
    events.filter(
      (event) =>
        Number(event.half) === 1
    );


  const secondHalf =
    events.filter(
      (event) =>
        Number(event.half) === 2
    );


  return {

    firstHalf:
      analyzeTeam(firstHalf),

    secondHalf:
      analyzeTeam(secondHalf)

  };

}


/* ========================================
   MATCH ANALYSIS
======================================== */

function analyzeMatch(events) {

  return {

    team:
      analyzeTeam(events),

    halves:
      analyzeByHalf(events),

    generatedAt:
      Date.now()

  };

}


/* ========================================
   GOALKEEPER ANALYSIS
======================================== */

function analyzeGoalkeepers(events) {

  const goalkeepers = {};


  const opponentShots =
    events.filter((event) =>

      event.type === "SHOT" &&

      String(
        event.team || ""
      ).toUpperCase() ===
        "OPPONENT" &&

      event.goalkeeperNumber

    );


  opponentShots.forEach((event) => {

    const number =
      String(
        event.goalkeeperNumber
      );


    if (!goalkeepers[number]) {

      goalkeepers[number] = {

        goalkeeperNumber:
          number,

        shotsFaced: 0,

        saves: 0,

        goalsAgainst: 0,

        saveRate: 0,

        courses: {},

        shotTypes: {},

        bestCourse: null,

        worstCourse: null

      };

    }


    const goalkeeper =
      goalkeepers[number];


    goalkeeper.shotsFaced++;


    if (isSave(event)) {
      goalkeeper.saves++;
    }


    if (isGoal(event)) {
      goalkeeper.goalsAgainst++;
    }


    const course =
      event.course || "UNKNOWN";


    if (!goalkeeper.courses[course]) {

      goalkeeper.courses[course] = {

        shotsFaced: 0,

        saves: 0,

        goalsAgainst: 0,

        saveRate: 0

      };

    }


    goalkeeper
      .courses[course]
      .shotsFaced++;


    if (isSave(event)) {

      goalkeeper
        .courses[course]
        .saves++;

    }


    if (isGoal(event)) {

      goalkeeper
        .courses[course]
        .goalsAgainst++;

    }


    const shotType =
      event.shotType ||
      "UNKNOWN";


    if (
      !goalkeeper
        .shotTypes[shotType]
    ) {

      goalkeeper
        .shotTypes[shotType] = {

          shotsFaced: 0,

          saves: 0,

          goalsAgainst: 0,

          saveRate: 0

        };

    }


    goalkeeper
      .shotTypes[shotType]
      .shotsFaced++;


    if (isSave(event)) {

      goalkeeper
        .shotTypes[shotType]
        .saves++;

    }


    if (isGoal(event)) {

      goalkeeper
        .shotTypes[shotType]
        .goalsAgainst++;

    }

  });


  Object
    .values(goalkeepers)
    .forEach((goalkeeper) => {

      goalkeeper.saveRate =
        calcRate(
          goalkeeper.saves,
          goalkeeper.shotsFaced
        );


      Object
        .values(goalkeeper.courses)
        .forEach((course) => {

          course.saveRate =
            calcRate(
              course.saves,
              course.shotsFaced
            );

        });


      Object
        .values(goalkeeper.shotTypes)
        .forEach((type) => {

          type.saveRate =
            calcRate(
              type.saves,
              type.shotsFaced
            );

        });


      const eligibleCourses =
        Object
          .entries(
            goalkeeper.courses
          )
          .filter(
            ([, data]) =>
              data.shotsFaced >= 3
          );


      if (
        eligibleCourses.length > 0
      ) {

        const sorted =
          [...eligibleCourses]
            .sort(
              (a, b) =>
                b[1].saveRate -
                a[1].saveRate
            );


        goalkeeper.bestCourse =
          sorted[0][0];


        goalkeeper.worstCourse =
          sorted[
            sorted.length - 1
          ][0];

      }

    });


  return goalkeepers;

}


/* ========================================
   MATCH HISTORY
======================================== */

matchHistoryButton.addEventListener(
  "click",
  () => {

    homeScreen.hidden = true;

    matchHistoryScreen.hidden =
      false;

    renderMatchHistory();

  }
);


backToHomeFromHistory.addEventListener(
  "click",
  () => {

    matchHistoryScreen.hidden =
      true;

    homeScreen.hidden =
      false;

  }
);


function renderMatchHistory() {

  const savedMatches =
    JSON.parse(
      localStorage.getItem(
        "handballMatches"
      )
    ) || [];


  matchHistoryList.innerHTML = "";


  if (
    savedMatches.length === 0
  ) {

    matchHistoryList.innerHTML =
      `<p class="no-matches">
        NO SAVED MATCHES
      </p>`;

    return;
  }


  const sortedMatches =
    [...savedMatches].sort(
      (a, b) =>
        b.id - a.id
    );


  sortedMatches.forEach(
    (match) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "match-history-card";


      card.innerHTML = `

        <div class="match-history-date">

          ${match.date || "NO DATE"}

        </div>


        <div class="match-history-teams">

          ${match.myTeam || "MY TEAM"}

          <span>vs</span>

          ${match.opponent || "OPPONENT"}

        </div>


        <button
          class="view-analysis-button"
          data-match-id="${match.id}"
        >
          VIEW ANALYSIS
        </button>

      `;


      matchHistoryList
        .appendChild(card);

    }
  );

}


/* ========================================
   OPEN ANALYSIS
======================================== */

matchHistoryList.addEventListener(
  "click",
  (event) => {

    const button =
      event.target.closest(
        ".view-analysis-button"
      );


    if (!button) {
      return;
    }


    const matchId =
      String(
        button.dataset.matchId
      );


    const savedMatches =
      JSON.parse(
        localStorage.getItem(
          "handballMatches"
        )
      ) || [];


    const selectedMatch =
      savedMatches.find(
        (match) =>
          String(match.id) ===
          matchId
      );


    if (!selectedMatch) {
      return;
    }


    matchHistoryScreen.hidden =
      true;

    analysisScreen.hidden =
      false;


    renderAnalysis(
      selectedMatch
    );

  }
);


/* ========================================
   BACK TO HISTORY
======================================== */

backToHistory.addEventListener(
  "click",
  () => {

    analysisScreen.hidden =
      true;

    matchHistoryScreen.hidden =
      false;

    renderMatchHistory();

  }
);


/* ========================================
   ANALYSIS TABS
======================================== */

const analysisTabs =
  document.querySelectorAll(
    ".analysis-tab"
  );


const analysisPanels = {

  overview:
    document.getElementById(
      "analysisOverview"
    ),

  players:
    document.getElementById(
      "analysisPlayers"
    ),

  goalkeepers:
    document.getElementById(
      "analysisGoalkeepers"
    ),

  team:
    document.getElementById(
      "analysisTeam"
    ),

  shotmap:
    document.getElementById(
      "analysisShotmap"
    )

};


analysisTabs.forEach((tab) => {

  tab.addEventListener(
    "click",
    () => {

      analysisTabs.forEach(
        (item) =>
          item.classList.remove(
            "active"
          )
      );


      tab.classList.add(
        "active"
      );


      Object
        .values(analysisPanels)
        .forEach(
          (panel) =>
            panel.hidden = true
        );


      const target =
        tab.dataset.analysisTab;


      if (
        analysisPanels[target]
      ) {

        analysisPanels[target]
          .hidden = false;

      }

    }
  );

});


/* ========================================
   RENDER ANALYSIS
======================================== */

function renderAnalysis(match) {

  const events =
    Array.isArray(match.events)
      ? match.events
      : [];


  /*
    OVERVIEWはMY TEAMだけを集計。
    OPPONENTのシュートを混ぜない。
  */

  const myTeamEvents =
    events.filter(
      (event) =>
        String(
          event.team || ""
        ).toUpperCase() ===
        "MY TEAM"
    );


  const team =
    analyzeTeam(
      myTeamEvents
    );


  const halves =
    analyzeByHalf(
      myTeamEvents
    );


  analysisMatchInfo.textContent =

    `${match.date || "NO DATE"} | ` +

    `${match.myTeam || "MY TEAM"} vs ` +

    `${match.opponent || "OPPONENT"}`;


  overviewContent.innerHTML = `

    <div class="analysis-summary">

      <div class="analysis-stat">
        <span>GOALS</span>
        <strong>
          ${team.totalGoals}
        </strong>
      </div>

      <div class="analysis-stat">
        <span>SHOTS</span>
        <strong>
          ${team.totalShots}
        </strong>
      </div>

      <div class="analysis-stat">
        <span>SHOT %</span>
        <strong>
          ${team.shotRate}%
        </strong>
      </div>

      <div class="analysis-stat">
        <span>ATTACK %</span>
        <strong>
          ${team.attackSuccessRate}%
        </strong>
      </div>

      <div class="analysis-stat">
        <span>SET %</span>
        <strong>
          ${team.setSuccessRate}%
        </strong>
      </div>

      <div class="analysis-stat">
        <span>FAST BREAK %</span>
        <strong>
          ${team.fastBreakSuccessRate}%
        </strong>
      </div>

      <div class="analysis-stat">
        <span>MISTAKES</span>
        <strong>
          ${team.mistakes}
        </strong>
      </div>

      <div class="analysis-stat">
        <span>MISTAKE %</span>
        <strong>
          ${team.mistakeRate}%
        </strong>
      </div>

    </div>


    <div class="half-analysis-table">

      <div>
        <strong>1ST HALF</strong>

        ${halves.firstHalf.totalGoals}
        GOALS /

        ${halves.firstHalf.totalShots}
        SHOTS /

        ${halves.firstHalf.shotRate}%

      </div>


      <div>
        <strong>2ND HALF</strong>

        ${halves.secondHalf.totalGoals}
        GOALS /

        ${halves.secondHalf.totalShots}
        SHOTS /

        ${halves.secondHalf.shotRate}%

      </div>

    </div>

  `;

}


/* ========================================
   INITIALIZE
======================================== */

updateTimer();
loadFromDevice();

