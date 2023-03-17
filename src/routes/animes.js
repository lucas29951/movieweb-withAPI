const express = require('express');
const router = express.Router();

const pool = require('../database');


router.get('/', async (req, res) => {
    const media = await pool.query('SELECT * FROM media WHERE data_type LIKE "anime";');
    res.render('animes/list', { media });
});

router.post('/', async (req, res) => {
    const { media_search } = req.body;
    const media = await pool.query('SELECT * FROM media WHERE data_type LIKE "anime" AND title LIKE ?', [media_search]);
    res.render('animes/list', { media, media_search });
});

router.get('/:title', async (req, res) => {
    const { title } = req.params;
    const media = await pool.query('SELECT * FROM media WHERE title LIKE ?', [title]);
    res.render('media/details', { media: media[0] });
});


module.exports = router;