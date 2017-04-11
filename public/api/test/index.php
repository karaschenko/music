<?php
    $audio = json_decode(file_get_contents('php://input'))->audio;

    $artist = $audio->artist;
    $title = $audio->title;
    $audioName = $artist.' - '.$title;

    $result = @file_get_contents('http://api.zaicev.parser.net/?searchOnce='.$audioName);

    //var_dump($audio);
    echo $result;