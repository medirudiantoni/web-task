const form = document.getElementById('collection_name');
const id = form.dataset.id;
form.addEventListener('mouseout', handleFormSubmit);
function handleFormSubmit(event) {
    event.preventDefault();

    // Ambil data dari form
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log("data: ", data);
    fetch(`/collections/api/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log('Success: ', result);
    })
    .catch(error => {
        console.log('Error: ', error)
    });
}