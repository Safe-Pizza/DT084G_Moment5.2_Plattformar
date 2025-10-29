// Denna fil ska innehålla din lösning till uppgiften (moment 5).

"use strict";

/*  Delar till ej obligatorisk funktionalitet, som kan ge poäng för högre betyg
*   Radera rader för funktioner du vill visa på webbsidan. */

/* Här under börjar du skriva din JavaScript-kod */

window.onload = init;

function init() {
    fetchChannels("https://api.sr.se/api/v2/channels?format=json");

    //skriver ut välkomsttext
    const infoEl = document.getElementById("info");

    //skapar element för välkomsttext
    const title = document.createElement("h3");
    const text = document.createElement("p");

    //skriv element
    title.innerHTML = "Välkommen till tablåer för Sveriges Radio";
    text.innerHTML = "Denna webb-applikation använder Sveriges Radios öppna API. <br>Välj kanal till vänster för att visa tablån för vald kanal.";

    //skriv ut välkomsttext til DOM
    infoEl.appendChild(title);
    infoEl.appendChild(text);
}

//ladda DOM
document.addEventListener("DOMContentLoaded", () => {

    //lyssnare för ändring av max antal
    document.getElementById("numrows").addEventListener("change", changeChannels);

    //lyssnare för radiospelarknapp
    document.getElementById("playbutton").addEventListener("click", playChannel);
})

//funktion för att hämta kanaler från Sveriges Radios API
function fetchChannels(url) {
    fetch(url)
        .then(res => res.json())
        .then(data => writeChannels(data.channels))
        .catch(error => console.log(`Något blev fel! Meddelande: ${error}`))
}

//funktion för att ändra antal listade kanaler
function changeChannels() {
    let valueChannels = document.getElementById("numrows").value;

    fetchChannels(`https://api.sr.se/api/v2/channels?format=json&pagination=true&size=${valueChannels}`);
}

//Skriv ut kanallista till DOM
function writeChannels(channels) {
    const mainnavListEl = document.getElementById("mainnavlist");
    const playchannelEl = document.getElementById("playchannel");

    mainnavListEl.innerHTML = "";
    playchannelEl.innerHTML = "";

    //loopar igenom kanaler
    channels.forEach(channel => {
        //skapa listelement med titel
        const liEl = document.createElement("li");
        liEl.title = channel.tagline;

        //lägg till namn på kanal
        liEl.innerHTML = channel.name;

        //skriv ut till DOM
        mainnavListEl.appendChild(liEl);

        //eventlyssnare för klick på li-element
        liEl.addEventListener("click", function () {
            fetchChannelInfo(channel.id);
        })
        //skapa option element med value och kanal
        const optionEl = document.createElement("option");
        optionEl.value = channel.id;
        optionEl.innerHTML = channel.name;

        //skriv ut till DOM
        playchannelEl.appendChild(optionEl);
    })
}

//hämta tablå för kanal
function fetchChannelInfo(id) {
    //lagra dagens datum i rätt format för API
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let date = today.getDate();
    let todaysDate = `${year}-${month}-${date}`;

    fetch(`https://api.sr.se/api/v2/scheduledepisodes?pagination=false&format=json&channelid=${id}&date=${todaysDate}`)
        .then(res => res.json())
        .then(data => writeChannelSchedules(data.schedule))
        .catch(error => console.log(`Det blev något fel. Meddlande: ${error}`))
}

//utskrift av kanaltablå till DOM
function writeChannelSchedules(schedules) {
    const infoEl = document.getElementById("info");

    //rensar DOM
    infoEl.innerHTML = "";

    //loopar igenom tablåer
    schedules.forEach(schedule => {
        //skapa datumobjekt
        const timeNow = new Date();
        let timeNowMs = timeNow.getTime();

        //hämta och konvertera start och sluttid
        let startTimeMs = parseInt(schedule.starttimeutc.slice(6, -2));
        let endTimeMs = parseInt(schedule.endtimeutc.slice(6, -2));

        //kontroll om programtid har passerat
        if (endTimeMs > timeNowMs) {
            let startTime = new Date(startTimeMs);
            let endTime = new Date(endTimeMs);
            let startTimeHours = startTime.getHours();
            let startTimeMinutes = startTime.getMinutes();
            let endTimeHours = endTime.getHours();
            let endTimeMinutes = endTime.getMinutes();

            //lägger till 0 innan om timmar eller minuter är under 10 för korrekt format
            if (startTimeHours < 10) {
                startTimeHours = "0" + startTimeHours;
            }

            if (startTimeMinutes < 10) {
                startTimeMinutes = "0" + startTimeMinutes;
            }

            if (endTimeHours < 10) {
                endTimeHours = "0" + endTimeHours;
            }

            if (endTimeMinutes < 10) {
                endTimeMinutes = "0" + endTimeMinutes;
            }

            //skapa element
            const articleEl = document.createElement("article");
            const titleEl = document.createElement("h3");
            const subtitleEl = document.createElement("h4");
            const airTimeEl = document.createElement("h5");
            const descriptionEl = document.createElement("p");

            //kontroll om subtitle finns
            if (schedule.subtitle === undefined) {
                //skriv element
                titleEl.innerHTML = schedule.title;
                airTimeEl.innerHTML = `${startTimeHours}:${startTimeMinutes} - ${endTimeHours}:${endTimeMinutes}`
                descriptionEl.innerHTML = schedule.description;

                //lägg till i article
                articleEl.appendChild(titleEl);
                articleEl.appendChild(airTimeEl);
                articleEl.appendChild(descriptionEl);

                //skriv ut till DOM
                infoEl.appendChild(articleEl);
            } else {
                //skriv element
                titleEl.innerHTML = schedule.title;
                subtitleEl.innerHTML = schedule.subtitle;
                airTimeEl.innerHTML = `Starttid: ${startTimeHours}:${startTimeMinutes} - Sluttid: ${endTimeHours}:${endTimeMinutes}`
                descriptionEl.innerHTML = schedule.description;

                //lägg till i article
                articleEl.appendChild(titleEl);
                articleEl.appendChild(subtitleEl);
                articleEl.appendChild(airTimeEl);
                articleEl.appendChild(descriptionEl);

                //skriv ut till DOM
                infoEl.appendChild(articleEl);
            }
        }
    })
}

//funktion för att spela livesändning
function playChannel() {
    const radioplayerEl = document.getElementById("radioplayer");
    const channelValue = document.getElementById("playchannel").value;

    radioplayerEl.innerHTML = "";

    //skriv ut radioplayer till DOM
    radioplayerEl.innerHTML = `<audio controls="" autoplay=""><source src="https://www.sverigesradio.se/topsy/direkt/srapi/${channelValue}.mp3" type="audio/mpeg"></audio>`
}