const express = require('express');
const router = express.Router();
const request = require('request');


const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const { apiKey } = require('../keys');
//const { response } = require('express');

router.get('/', async (req, res) => {
    const media = await pool.query('SELECT * FROM media ORDER BY id DESC');
    res.render('index', { media });
});

router.post('/', async (req, res) => {
    const { media_search } = req.body;
    const media = await pool.query('SELECT * FROM media WHERE title LIKE ?', [media_search]);
    res.render('index', { media, media_search });
});

router.get('/movies', async (req, res) => {
    const media = await pool.query('SELECT * FROM media WHERE data_type LIKE "movie";');
    res.render('movies/list', { media });
});

router.get('/series', async (req, res) => {
    const media = await pool.query('SELECT * FROM media WHERE data_type LIKE "series";');
    res.render('series/list', { media });
});

router.get('/animes', async (req, res) => {
    const media = await pool.query('SELECT * FROM media WHERE data_type LIKE "anime";');
    res.render('animes/list', { media });
});

router.get('/profile', isLoggedIn, async (req, res) => {
    const files = await pool.query('SELECT * FROM media;');
    const movies = await pool.query('SELECT * FROM media WHERE data_type LIKE "movie";');
    const series = await pool.query('SELECT * FROM media WHERE data_type LIKE "series";');
    const anime = await pool.query('SELECT * FROM media WHERE data_type LIKE "anime";');
    res.render('profile', { files, movies, series, anime });
});

router.get('/dashboard', isLoggedIn, async (req, res) => {
    const media = await pool.query('SELECT * FROM media ORDER BY id DESC;');
    res.render('dashboard', { media });
});

router.post('/dashboard', isLoggedIn, async (req, res) => {
    const { media_search } = req.body;
    const media = await pool.query('SELECT * FROM media WHERE title LIKE ?', [media_search]);
    res.render('dashboard', { media, media_search });
});

router.get('/dashboard/:title', isLoggedIn, async (req, res) => {
    const { title } = req.params;
    const media = await pool.query('SELECT * FROM media WHERE title LIKE ?', [title]);
    res.render('media/details', { media: media[0] });
});

router.get('/search', isLoggedIn, (req, res) => {
    res.render('search');
});

router.get('/searchTitle', isLoggedIn, (req, res) => {
    const title_search = req.query.title_search;
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${title_search}`;

    request(url, (error, response, body) => {
        if (error) {
            console.log(error);
            req.flash('error', 'Error: ' + error);
            res.redirect('/');
        } else {
            const data = JSON.parse(body);
            
            res.render('search', { results: data.Search });
        }
    });
});

router.get('/save/:id', isLoggedIn, (req, res) => {
    const id = req.params.id;

    const url = `http://www.omdbapi.com/?i=${id}&apikey=${apiKey}`;
    request(url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const movie = JSON.parse(body);
            
            const title = movie.Title;
            const years = movie.Year;
            const released = movie.Released;
            const genre = movie.Genre;
            const director = movie.Director;
            const actors = movie.Actors;
            const plot = movie.Plot;
            const poster = movie.Poster;
            const data_type = movie.Type;

            const media = {title,years,released,genre,director,actors,plot,poster,data_type};
            res.render('files/addAPI', { media: media });
        }
    });
});

module.exports = router;