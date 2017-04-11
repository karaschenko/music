function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function getCss(elem, css, substr){
    var style = getComputedStyle(elem)[css].substr(0, getComputedStyle(elem)[css].length-substr);
    return parseInt(style);
}