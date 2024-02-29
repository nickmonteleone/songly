-- both test users have the password "password"

INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'test@user.com',
        FALSE),
       ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin!',
        'test@admin.com',
        TRUE);

INSERT INTO playlists (handle, name, description, logo_url)
VALUES ('pop',
        'Pop Hits',
        'Pop hits for a good time!',
        'https://images.unsplash.com/photo-1563891217861-7924b471afb3?w=200'),
        ('rock',
        'Rock Hits',
        'Rock hits to rock out!',
        'https://images.unsplash.com/photo-1584715642381-6f1c4b452b1c?w=200');


INSERT INTO songs (title, artist, link, playlist_handle)
VALUES ('Get Lucky',
        'Daft Punk',
        'https://soundcloud.com/daftpunkofficialmusic/get-lucky',
        'pop'),
        ('Beyond',
        'Daft Punk',
        'https://soundcloud.com/daftpunkofficialmusic/beyond',
        'pop'),
        ('Shape of You',
        'Ed Sheeran',
        'https://soundcloud.com/edsheeran/shape-of-you',
        'pop'),
        ('good 4 you',
        'Olivia Rodrigo',
        'https://soundcloud.com/oliviarodrigo/good-4-u-1',
        'pop'),
        ('Listen to the Music',
        'The Doobie Brothers',
        'https://soundcloud.com/thedoobiebrothers/listen-to-the-music-1',
        'rock'),
        ('Sultans of Swing',
        'Dire Straits',
        'https://soundcloud.com/direstraits/sultans-of-swing-1',
        'rock'),
        ('get him back!',
        'Olivia Rodrigo',
        'https://soundcloud.com/oliviarodrigo/get-him-back',
        'rock');