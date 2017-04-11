<?php
    session_start();
    include_once("../config.php");

    $request_params = array(
        'client_id'         => API_KEY,
        'client_secret'     => SECRET,
        'redirect_uri'      => BASE_URL.'/api/auth',
        'code'              => $_GET['code']
    );
    $get_params = http_build_query($request_params);

    $_SESSION['auth'] = @json_decode(@file_get_contents('https://oauth.vk.com/access_token?'.$get_params));

    header('Location: /');