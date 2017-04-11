<?php
    session_start();
    include_once 'config.php';


    if ($_GET['auth_status']) {
        if ($_SESSION['auth']) echo 'true';
    }

    if ($_GET['logout']) {
        unset($_SESSION['auth']);
    }

    if ($_GET['api_key']) {
        echo API_KEY;
    }

    if ($_GET['get_auth_link']) {
        $request_params = array(
            'client_id'         => API_KEY,
            'redirect_uri'      => BASE_URL.'/api/auth',
            'display'           => 'page',
            'scope'             => 'audio,offline',
            'response_type'     => 'code',
            'revoke'            => '1',
            'v'                 => API_V
        );
        $get_params = http_build_query($request_params);

        echo 'https://oauth.vk.com/authorize?'. $get_params;
    }

    if ($method = $_GET['api']) {
        $url = 'https://api.vk.com/method/';

        if ($method == 'audio.get') {
            echo call_api($url.$method, array(
                'owner_id'      => $_SESSION['auth']->user_id,
                //'count'         => 10,
                'access_token'  => $_SESSION['auth']->access_token,
                'v'             => API_V
            ));
        }

        if ($method == 'audio.getRecommendations') {
            echo call_api($url.$method, array(
                'user_id'      => $_SESSION['auth']->user_id,
                'count'         => 200,
                'access_token'  => $_SESSION['auth']->access_token,
                'v'             => API_V
            ));
        }

        if ($method == 'audio.getPopular') {

            echo call_api($url.$method, array(
                'only_eng'      => $_GET['eng_only'],
                'genre_id'      => $_GET['genre'],
                'count'         => 1000,
                'access_token'  => $_SESSION['auth']->access_token,
                'v'             => API_V
            ));

        }
    }

    if ($_GET['images']) {
        $request = json_decode(file_get_contents('php://input'))->data;

        $no_images = file_get_contents('../img/covers/no_image.txt');

        $files = [];
        if ($handle = opendir('../img/covers/')) {
            while (false !== ($file = readdir($handle))) {
                if ($file != "." && $file != "..") $files[] = $file;
            }
            closedir($handle);
        }

        $result = [];
        for ($i = 0; $i < count($request); $i++) {
            if (in_array($request[$i]->owner_id.'_'.$request[$i]->id.'.jpg', $files)) {
                $result[] = (object)array(
                    'uid'   => $request[$i]->owner_id,
                    'aid'    => $request[$i]->id
                );
            } elseif (strripos($no_images, $request[$i]->owner_id . '_' . $request[$i]->id) != false ) {

            } else {
                $img = getImage($request[$i]->owner_id, $request[$i]->id, $request[$i]->url);

                if ($img) $result[] = (object)array(
                    'uid'   => $request[$i]->owner_id,
                    'aid'    => $request[$i]->id
                );
            }
        }
        echo json_encode($result);
    }

    function call_api($link, $params) {
        $result = file_get_contents($link.'?'.http_build_query($params));
        return $result;
    }

    function getImage($uid, $aid, $url){
        $link = $url;

        if ($handle = @fopen($link, "r")) {
            $contents = fread($handle, 10);

            if (substr($contents, 0, 3) == 'ID3') {
                $size = str_split(substr(bin2hex($contents), 12), 2);

                $size_bit = [];
                for ($i = 0; $i < count($size); $i++) {
                    $size_bit[$i] = substr(hex2bit($size[$i][0]).hex2bit($size[$i][1]), 1);
                }

                $size = bindec(implode('', $size_bit))+4;

                unset($contents);
                $contents = '';
                while(strlen($contents) <= $size) {
                    $contents .= fread($handle, 1024);
                }

                $contents = substr($contents, 0, $size);

                if (strpos($contents, 'APIC')) {
                    $image = false;
                    $name = '../img/covers/'.$uid.'_'.$aid;

                    if (strpos($contents, 'ÿØÿà')){
                        //imageResize($name.'_b.jpg', substr($contents, strpos($contents, 'ÿØÿà')), 512, 512, 70);
                        imageResize($name.'_m.jpg', substr($contents, strpos($contents, 'ÿØÿà')), 72, 72, 50);
                        $image = $uid.'_'.$aid;
                    } elseif (strpos($contents, '‰PNG')) {
                        //imageResize($name.'_b.jpg', substr($contents, strpos($contents, '‰PNG')), 512, 512, 70);
                        imageResize($name.'_m.jpg', substr($contents, strpos($contents, '‰PNG')), 72, 72, 50);
                        $image = $uid.'_'.$aid;
                    } else {
                        file_put_contents('../img/covers/no_image.txt', $uid.'_'.$aid."\r\n", FILE_APPEND);
                    }

                    if ($image) {
                        return $image;
                    } else {
                        file_put_contents('../img/covers/no_image.txt', $uid.'_'.$aid."\r\n", FILE_APPEND);
                    }
                } else {
                    file_put_contents('../img/covers/no_image.txt', $uid.'_'.$aid."\r\n", FILE_APPEND);
                }
            } else {
                file_put_contents('../img/covers/no_image.txt', $uid.'_'.$aid."\r\n", FILE_APPEND);
            }
            fclose($handle);
        } else {
            file_put_contents('../img/covers/no_image.txt', $uid.'_'.$aid."\r\n", FILE_APPEND);
        }
        return false;
    }

    function imageResize($outfile, $infile, $neww, $newh, $quality) {

        $im = imagecreatefromstring($infile);
        $im1 = imagecreatetruecolor($neww, $newh);
        imagecopyresampled($im1, $im, 0, 0, 0, 0, $neww, $newh, imagesx($im), imagesy($im));

        ob_start();
        imagejpeg($im1, NULL, $quality);

        $result = ob_get_clean();

        ob_clean();
        imagedestroy($im);
        imagedestroy($im1);

        file_put_contents($outfile, $result);
    }

    function linkCheck($link){

        if ($status = @get_headers($link, 1)) {
            if (strripos($status[0], '302') != false) {
                $size = max($status['Content-Length']);
                $link = $status['Location'][count($status['Location'])-1];
            } else {
                $size = $status['Content-Length'];
            }

            return array($link, $size);
        } else {
            return array($link, 0);
        }

    }

    function hex2bit($hex){
        $mask = array(
            '0' => '0000',
            '1' => '0001',
            '2' => '0010',
            '3' => '0011',
            '4' => '0100',
            '5' => '0101',
            '6' => '0110',
            '7' => '0111',
            '8' => '1000',
            '9' => '1001',
            'a' => '1010',
            'b' => '1011',
            'c' => '1100',
            'd' => '1101',
            'e' => '1110',
            'f' => '1111'
        );
        return $mask[$hex];
    }