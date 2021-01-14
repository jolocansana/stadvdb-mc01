const sqlite3 = require('sqlite3').verbose();
const express = require('express')
const bodyParser = require('body-parser')
const envPort = require('./config.js')

var app = express()
var port = envPort.port || 3000;
var hbs = require('express-handlebars')

let db = new sqlite3.Database('nba.db');

app.engine('hbs', hbs({
    extname: 'hbs',
    defaultview: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/'
}))

app.set('view engine', 'hbs')

app.set('port', process.env.PORT || 9090)

app.use(express.static(__dirname + '/public'))

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ----- [ SAMPLE QUERY, JUST COPY THIS FOR THE OTHERS ] ------
app.get('/', (req,res) => {
  res.render('index')
})

app.post('/', (req,res) => {
  let sql = `SELECT * FROM Players WHERE PlayerID = ?`
  let startTime = (new Date).getTime();

  db.all (sql, [req.body.playerid], (err, rows) => 
      {
        res.render('index', {
          result: rows,
          time: ((new Date).getTime() - startTime)+'ms'
        })
      }
  )

})
// -------------------------------------------------------


// --- SELECTOR ARRAY DATA ---
let teams = ["CHI","LAC","TOR","DAL","MIA","HOU","LAL","ATL","MIL","DEN","SEA","POR","VAN","NJN","BOS","IND","SAC","MIN","PHI","ORL","SAS","PHX","DET","CHH","CLE","GSW","UTA","WAS","NYK","MEM","NOH","CHA","NOK","OKC","BKN","NOP"]
let seasons = ["1996-97","1997-98","1998-99","1999-00","2000-01","2001-02","2002-03","2003-04","2004-05","2005-06","2006-07","2007-08","2008-09","2009-10","2010-11","2011-12","2012-13","2013-14","2014-15","2015-16","2016-17","2017-18","2018-19","2019-20"]
let draft_year = ["1987","1988","1989","1990","1991","1992","1993","1994","1995","1996","1997","1998","1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017","2018","2019"]
let draft_round = ["1","2","3","4","6","7","8"]
let stats = ['AvgPoints', 'AvgRebounds', 'AvgAssists', 'Net_Rating']
let stats_query1_1 = ['AvgRebounds', 'AvgAssists', 'Net_Rating']
// ---------------------------

// ----- [ QUERY 1.1 ] ------
app.get('/query1-1', (req,res) => {
  res.render('query1-1', {
    stats: stats_query1_1
  })
})

app.post('/query1-1', (req,res) => {
  let sql;

  switch (req.body.stats) {
    case "AvgRebounds":
      sql = `
          SELECT t.Range, AVG(t.Avg_Points) as AvgPoints
          FROM (SELECT CASE
                WHEN AvgRebounds BETWEEN 0.0 AND 5.4 THEN '1. 0-5'
                WHEN AvgRebounds BETWEEN 5.5 AND 10.4 THEN '2. 6-10'
                WHEN AvgRebounds BETWEEN 10.5 AND 15.9 then '3. 11-15'
                ELSE '4. 16+'
                END AS Range, st.AvgPoints AS Avg_Points
                FROM Stats st) t
          GROUP BY t.Range`
      break;
    case "AvgAssists":
      sql = `
          SELECT t.Range, AVG(t.Avg_Points) as AvgPoints
          FROM (SELECT CASE
                WHEN AvgAssists BETWEEN 0.0 AND 5.4 THEN '1. 0-5'
                WHEN AvgAssists BETWEEN 5.5 AND 10.4 THEN '2. 6-10'
                WHEN AvgAssists BETWEEN 10.5 AND 15.9 then '3. 11-15'
                ELSE '4. 16+'
                END AS Range, st.AvgPoints AS Avg_Points
                FROM Stats st) t
          GROUP BY t.Range`
      break;
    case "Net_Rating":
      sql = `
          SELECT t.Range, AVG(t.Avg_Points) as AvgPoints
          FROM (SELECT CASE
                WHEN Net_Rating BETWEEN 0.0 AND 5.4 THEN '1. 0-5'
                WHEN Net_Rating BETWEEN 5.5 AND 10.4 THEN '2. 6-10'
                WHEN Net_Rating BETWEEN 10.5 AND 15.9 then '3. 11-15'
                ELSE '4. 16+'
                END AS Range, st.AvgPoints AS Avg_Points
                FROM Stats st) t
          GROUP BY t.Range`
        break;
    default:
      console.log("Switch Error!");
      break;
  }

  let startTime = (new Date).getTime();
  console.log(req.body)
  db.all (sql, (err, rows) => 
      {
        res.render('query1-1', {
          stats: stats_query1_1,
          selected_stat: req.body.stats,
          result: rows,
          time: ((new Date).getTime() - startTime)+'ms'
        })
        console.log(rows);
      }
  )

})
// -------------------------------------------------------

// ----- [ QUERY 1.2 ] ------
app.get('/query1-2', (req,res) => {
  res.render('query1-2', {
    stats: stats
  })
})

app.post('/query1-2', (req,res) => {
  let sql;
  switch (req.body.stats) {
    case "AvgPoints":
      sql = ` 
      SELECT st.Games_Played, COUNT(st.StatsID) as Count, AVG(st.AvgPoints) as Average_Stat
      FROM (SELECT StatsID, Games_Played, AvgPoints FROM Stats
            WHERE Games_Played BETWEEN ? AND ?)  st
      GROUP BY st.Games_Played
      ORDER BY st.Games_Played ASC`
      break;
    case "AvgRebounds":
      sql = ` 
      SELECT st.Games_Played, COUNT(st.StatsID) as Count, AVG(st.AvgRebounds) as Average_Stat
      FROM (SELECT StatsID, Games_Played, AvgRebounds FROM Stats
            WHERE Games_Played BETWEEN ? AND ?)  st
      GROUP BY st.Games_Played
      ORDER BY st.Games_Played ASC`
      break;
    case "AvgAssists":
      sql = ` 
      SELECT st.Games_Played, COUNT(st.StatsID) as Count, AVG(st.AvgAssists) as Average_Stat
      FROM (SELECT StatsID, Games_Played, AvgAssists FROM Stats
            WHERE Games_Played BETWEEN ? AND ?)  st
      GROUP BY st.Games_Played
      ORDER BY st.Games_Played ASC`
      break;
    case "Net_Rating":
        sql = ` 
        SELECT st.Games_Played, COUNT(st.StatsID) as Count, AVG(st.Net_Rating) as Average_Stat
        FROM (SELECT StatsID, Games_Played, Net_Rating FROM Stats
              WHERE Games_Played BETWEEN ? AND ?)  st
        GROUP BY st.Games_Played
        ORDER BY st.Games_Played ASC`
        break;
    default:
      console.log("Switch Error!");
      break;
  }

  let startTime = (new Date).getTime();
  console.log(req.body)
  db.all (sql, [req.body.min, req.body.max], (err, rows) => 
      {
        res.render('query1-2', {
          stats: stats,
          selected_stat: req.body.stats,
          result: rows,
          time: ((new Date).getTime() - startTime)+'ms'
        })
        console.log(rows);
      }
  )

})
// -------------------------------------------------------

// ----- [ QUERY 2.1 ] ------
app.get('/query2-1', (req,res) => {
  res.render('query2-1', {
    teams: teams,
    seasons: seasons
  })
})

app.post('/query2-1', (req,res) => {
  let sql = `
  SELECT r.team_abbreviation, r.Current_Season, MAX(r.height) AS AvgHeight
  FROM (SELECT se.team_abbreviation, se.current_season, pi.Height
        FROM (SELECT SeasonID, team_abbreviation, Current_Season 
                FROM Seasons
                WHERE team_abbreviation = ?
                AND Current_Season = ?) se
                JOIN (SELECT Season_ID, Height FROM Personal_Information) pi
                ON se.SeasonID = pi.Season_ID) r
  GROUP BY r.Team_Abbreviation`
  let startTime = (new Date).getTime();
  console.log(req.body)
  db.all (sql, [req.body.team, req.body.season], (err, rows) => 
      {
        res.render('query2-1', {
          teams: teams,
          seasons: seasons,
          result: rows,
          time: ((new Date).getTime() - startTime)+'ms'
        })
        console.log(rows);
      }
  )

})
// -------------------------------------------------------

// ----- [ QUERY 2.2 ] ------
app.get('/query2-2', (req,res) => {
  res.render('query2-2', {
    draft_round: draft_round
  })
})

app.post('/query2-2', (req,res) => {
  let sql = ` 
  SELECT r.college, MAX(r.Times_Drafted) as Draft_Picks
  FROM (SELECT pl.college, COUNT(pl.college) as Times_Drafted
      FROM Players pl
      JOIN Draft_Details dd
      ON pl.Draft_ID = dd.DraftID
      WHERE dd.draft_round = ?
      AND NOT College = 'None'
      GROUP BY pl.college
      ORDER BY COUNT(pl.college) DESC) r`
  let startTime = (new Date).getTime();
  console.log(req.body)
  db.all (sql, [req.body.draft_round], (err, rows) => 
      {
        res.render('query2-2', {
          draft_round: draft_round,
          result: rows,
          time: ((new Date).getTime() - startTime)+'ms'
        })
        console.log(rows);
      }
  )

})
// -------------------------------------------------------


// ----- [ QUERY 3.1 ] ------
app.get('/query3-1', (req,res) => {
  res.render('query3-1', {
    teams: teams,
    seasons: seasons
  })
})

app.post('/query3-1', (req,res) => {
  let sql = `
        SELECT r.team_abbreviation, r.Current_Season, AVG(r.Height), AVG(r.AvgPoints)
        FROM  (SELECT s.team_abbreviation, s.Current_Season, pi.Height, st.AvgPoints
                FROM Seasons s
                JOIN (SELECT Height, Season_ID FROM Personal_Information) pi
                ON s.SeasonID = pi.Season_ID
                JOIN (SELECT AvgPoints, Season_ID FROM Stats) st 
                ON s.SeasonID = st.Season_ID
                WHERE s.team_abbreviation = ?
                AND  s.Current_Season = ?
                ORDER BY st.AvgPoints DESC
                LIMIT 5) r
        GROUP BY r.team_abbreviation`
  let startTime = (new Date).getTime();
  console.log(req.body)
  db.all (sql, [req.body.team, req.body.season], (err, rows) => 
      {
        res.render('query3-1', {
          teams: teams,
          seasons: seasons,
          result: rows,
          time: ((new Date).getTime() - startTime)+'ms'
        })
        console.log(rows);
      }
  )

})
// -------------------------------------------------------

// ----- [ QUERY 3.2 ] ------
app.get('/query3-2', (req,res) => {
  res.render('query3-2', {
    seasons: seasons
  })
})

app.post('/query3-2', (req,res) => {
  let sql = `
            SELECT r.college, r.Current_Season, AVG(r.AvgPoints)
            FROM (SELECT college, current_season, AvgPoints
                    FROM Seasons s
                    JOIN (SELECT PlayerID, College FROM Players) pi
                    ON pi.PlayerID = s.Player_ID
                    JOIN (SELECT AvgPoints, Season_ID FROM Stats) st
                    ON s.SeasonID = st.Season_ID
                    WHERE current_season = ?)  r
            GROUP BY r.college
            ORDER BY AVG(r.AvgPoints) DESC
            LIMIT 5`
  let startTime = (new Date).getTime();
  console.log(req.body)
  db.all (sql, [req.body.season], (err, rows) => 
      {
        res.render('query3-2', {
          seasons: seasons,
          result: rows,
          time: ((new Date).getTime() - startTime)+'ms'
        })
        console.log(rows);
      }
  )

})
// -------------------------------------------------------
// ----- [ QUERY 4.1 ] ------
app.get('/query4-1', (req,res) => {
  res.render('query4-1', {
    seasons: seasons,
    draft_year: draft_year,
    stats: stats
  })
})

app.post('/query4-1', (req,res) => {
  let sql;
  
  switch (req.body.stats) {
    case "AvgPoints":
      sql =  `SELECT r.country, AVG(r.AvgPoints) as AvgStat, COUNT(r.AvgPoints) as CountStat
              FROM (SELECT p.country, current_season, st.AvgPoints
                      FROM Seasons s
                      JOIN (SELECT PlayerID, country, Draft_ID FROM Players WHERE NOT country = "USA")  p
                      ON p.PlayerID = s.Player_ID
                      JOIN (SELECT DraftID, Draft_Year FROM Draft_Details WHERE Draft_Year = ?)  d
                      ON d.DraftID = p.Draft_ID
                      JOIN (SELECT AvgPoints, Season_ID FROM Stats) st
                      ON s.SeasonID = st.Season_ID
                      WHERE current_season = ?)  r
              GROUP BY r.country
              ORDER BY AVG(r.AvgPoints) DESC
              LIMIT 3`
      break;
    case "AvgRebounds":
      sql =  `SELECT r.country, AVG(r.AvgRebounds) as AvgStat, COUNT(r.AvgRebounds) as CountStat
              FROM (SELECT p.country, current_season, st.AvgRebounds
                      FROM Seasons s
                      JOIN (SELECT PlayerID, country, Draft_ID FROM Players WHERE NOT country = "USA")  p
                      ON p.PlayerID = s.Player_ID
                      JOIN (SELECT DraftID, Draft_Year FROM Draft_Details WHERE Draft_Year = ?)  d
                      ON d.DraftID = p.Draft_ID
                      JOIN (SELECT AvgRebounds, Season_ID FROM Stats) st
                      ON s.SeasonID = st.Season_ID
                      WHERE current_season = ?)  r
              GROUP BY r.country
              ORDER BY AVG(r.AvgRebounds) DESC
              LIMIT 3`
      break;
    case "AvgAssists":
      sql =  `SELECT r.country, AVG(r.AvgAssists) as AvgStat, COUNT(r.AvgAssists) as CountStat
              FROM (SELECT p.country, current_season, st.AvgAssists
                      FROM Seasons s
                      JOIN (SELECT PlayerID, country, Draft_ID FROM Players WHERE NOT country = "USA")  p
                      ON p.PlayerID = s.Player_ID
                      JOIN (SELECT DraftID, Draft_Year FROM Draft_Details WHERE Draft_Year = ?)  d
                      ON d.DraftID = p.Draft_ID
                      JOIN (SELECT AvgAssists, Season_ID FROM Stats) st
                      ON s.SeasonID = st.Season_ID
                      WHERE current_season = ?)  r
              GROUP BY r.country
              ORDER BY AVG(r.AvgAssists) DESC
              LIMIT 3`
      break;
    case "Net_Rating":
      sql =  `SELECT r.country, AVG(r.Net_Rating) as AvgStat, COUNT(r.Net_Rating) as CountStat
              FROM (SELECT p.country, current_season, st.Net_Rating
                      FROM Seasons s
                      JOIN (SELECT PlayerID, country, Draft_ID FROM Players WHERE NOT country = "USA")  p
                      ON p.PlayerID = s.Player_ID
                      JOIN (SELECT DraftID, Draft_Year FROM Draft_Details WHERE Draft_Year = ?)  d
                      ON d.DraftID = p.Draft_ID
                      JOIN (SELECT Net_Rating, Season_ID FROM Stats) st
                      ON s.SeasonID = st.Season_ID
                      WHERE current_season = ?)  r
              GROUP BY r.country
              ORDER BY AVG(r.Net_Rating) DESC
              LIMIT 3`
        break;
    default:
      console.log("Switch Error!");
      break;
  }

  let startTime = (new Date).getTime();
  console.log(req.body)
  db.all (sql, [req.body.draft_year, req.body.season], (err, rows) => 
    {
    res.render('query4-1', {
      seasons: seasons,
      draft_year: draft_year,
      stats: stats,
      chosen_stat: req.body.stats,
      result: rows,
      time: ((new Date).getTime() - startTime)+'ms'
    })
    console.log(rows);
    }
  )

})
// -------------------------------------------------------

app.listen(port, () => {
  console.log(`Server listening at ${port}`);
});