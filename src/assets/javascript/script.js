function redirectTo(url){
    window.location.href = url
};

function isDelete(url){
    const isYes = confirm('Are you sure?');
    isYes ? redirectTo(url) : false;
};
