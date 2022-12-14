function processContactForm() {
    const form = document.getElementById("contactFormForm");
    const formData = new FormData(form);

    return sendEmail(
        formData.get("name"),
        formData.get("checkin"),
        formData.get("checkout"),
        formData.get("numguests"),
        formData.get("email"),
        formData.get("message")
    )

}


function sendEmail(name, dateFrom, dateTo, numGuests, email, message) {
    console.log(name, dateFrom, dateTo);

    var username = 'b910e9ae912010ef076b0b1fb455a700';
    var password = 'ec15927fc9a7a1a266d175121fed48c2';
    const url = 'https://api.mailjet.com/v3.1/send';
    var data = {
        "Messages":[
            {
            "From": {
                "Email": "jordi.solerbusquets@gmail.com",
                "Name": "Villa can Soler"       
            },  
            "To": [
                {
                "Email": "hola@villacansoler.com",
                "Name": "Hola Can Soler"
                }
            ],
            "Subject": "Missatge de prova web amb autoritzacio",
            "TextPart": "Holi.",
            "HTMLPart": "Prova web"
            }
        ]
    };

    fetch(url, {
        method: 'POST',
        // mode: 'no-cors',
        headers: {
            Authorization: "Basic YjkxMGU5YWU5MTIwMTBlZjA3NmIwYjFmYjQ1NWE3MDA6ZWMxNTkyN2ZjOWE3YTFhMjY2ZDE3NTEyMWZlZDQ4YzI=",
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Origin': 'http://villacansoler.com'
        },
        body: JSON.stringify(data),
    })

}