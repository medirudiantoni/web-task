function redirectTo(url){
    window.location.href = url
};

function isDelete(url){
    const isYes = confirm('Are you sure?');
    isYes ? redirectTo(url) : false;
};


const form = document.getElementById('collection_name');
form.addEventListener('mouseout', handleFormSubmit);
function handleFormSubmit(event) {
    event.preventDefault();

    // Ambil elemen form

    // Ambil data dari form
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log('Form data:', data);

    fetch('')

    // Contoh pengiriman data menggunakan fetch
    // fetch('https://example.com/api/submit', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data)
    // })
    // .then(response => response.json())
    // .then(result => {
    //     console.log('Success:', result);
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    // });
}
