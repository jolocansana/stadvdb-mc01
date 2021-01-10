const sqlite3 = require('sqlite3').verbose();
const express = require('express')
const bodyParser = require('body-parser')
const envPort = require('./public/config.js')

var app = express()
var port = envPort || 3000;
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
let stats = ['AvgPoints', 'AvgRebounds', 'AvgAssists', 'Net_Rating']
// ---------------------------

// ----- [ QUERY 3.1 ] ------
app.get('/query3-1', (req,res) => {
  res.render('query3-1', {
    teams: teams,
    seasons: seasons
  })
})

app.post('/query3-1', (req,res) => {
  let sql = ` SELECT r.team_abbreviation, r.Current_Season, AVG(r.Height), AVG( r.AvgPoints)
              FROM (SELECT  se.team_abbreviation, se.Current_Season, pi.Height,  st.AvgPoints
                      FROM Seasons as se
                      JOIN Personal_Information pi
                      ON se.SeasonID = pi.Season_ID
                      JOIN Stats st
                      ON se.SeasonID = st.Season_ID
                      WHERE se.Team_Abbreviation = ?
                      AND se.Current_Season = ?
                      ORDER BY st.AvgPoints DESC
                      LIMIT 5)  r
              GROUP BY r.Team_Abbreviation`
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
  let sql = ` SELECT p.College, se.Current_Season, AVG(st.AvgPoints)
              FROM Players as p
              JOIN Seasons se
              ON p.PlayerID = se.Player_ID
              JOIN Stats st
              ON se.SeasonID = st.Season_ID
              WHERE se.Current_Season = ?
              GROUP BY p.College
              ORDER BY AVG(st.AvgPoints) DESC
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
      sql = ` SELECT p.name, st.AvgPoints as AvgStat
                      FROM Players p
                      JOIN Draft_Details d
                      ON d.DraftID = p.Draft_ID
                      JOIN Seasons se
                      ON p.PlayerID = se.Player_ID
                      JOIN Stats st
                      ON se.SeasonID = st.Season_ID
                      WHERE d.Draft_Year = ?
                      AND se.Current_Season = ?
                      GROUP BY st.AvgPoints
                      ORDER BY st.AvgPoints DESC
                      LIMIT 5`
      break;
    case "AvgRebounds":
      sql = ` SELECT p.name, st.AvgRebounds as AvgStat
                      FROM Players p
                      JOIN Draft_Details d
                      ON d.DraftID = p.Draft_ID
                      JOIN Seasons se
                      ON p.PlayerID = se.Player_ID
                      JOIN Stats st
                      ON se.SeasonID = st.Season_ID
                      WHERE d.Draft_Year = ?
                      AND se.Current_Season = ?
                      GROUP BY st.AvgRebounds
                      ORDER BY st.AvgRebounds DESC
                      LIMIT 5`
      break;
    case "AvgAssists":
      sql = ` SELECT p.name, st.AvgAssists as AvgStat
                      FROM Players p
                      JOIN Draft_Details d
                      ON d.DraftID = p.Draft_ID
                      JOIN Seasons se
                      ON p.PlayerID = se.Player_ID
                      JOIN Stats st
                      ON se.SeasonID = st.Season_ID
                      WHERE d.Draft_Year = ?
                      AND se.Current_Season = ?
                      GROUP BY st.AvgAssists
                      ORDER BY st.AvgAssists DESC
                      LIMIT 5`
      break;
    case "Net_Rating":
        sql = ` SELECT p.name, st.Net_Rating as AvgStat
                        FROM Players p
                        JOIN Draft_Details d
                        ON d.DraftID = p.Draft_ID
                        JOIN Seasons se
                        ON p.PlayerID = se.Player_ID
                        JOIN Stats st
                        ON se.SeasonID = st.Season_ID
                        WHERE d.Draft_Year = ?
                        AND se.Current_Season = ?
                        GROUP BY st.Net_Rating
                        ORDER BY st.Net_Rating DESC
                        LIMIT 5`
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