const init = () => {
    const filmListElement = document.getElementById('films');
    const posterElement = document.getElementById('poster');
    const titleElement = document.getElementById('title');
    const runtimeElement = document.getElementById('runtime');
    const filmInfoElement = document.getElementById('film-info');
    const showtimeElement = document.getElementById('showtime');
    const ticketNumElement = document.getElementById('ticket-num');
    const buyTicketButton = document.getElementById('buy-ticket');

    // Fetch all films on page load
    fetchFilms();

    function fetchFilms() {
        fetch('http://localhost:3000/films')
            .then(response => response.json())
            .then(films => {
                filmListElement.innerHTML = '';
                films.forEach(film => {
                    const li = document.createElement('li');
                    li.classList.add('film', 'item');
                    li.textContent = film.title;
                    li.dataset.film = JSON.stringify(film);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('ui', 'red', 'button');
                    deleteButton.onclick = (event) => {
                        event.stopPropagation();
                        deleteFilm(film.id, li);
                    };

                    li.appendChild(deleteButton);
                    li.onclick = () => displayFilmDetails(film);
                    filmListElement.appendChild(li);
                });
                if (films.length > 0) {
                    displayFilmDetails(films[0]);
                }
            })
            .catch(error => {
                console.error("Error fetching films:", error);
            });
    }

    function displayFilmDetails(film) {
        posterElement.src = film.poster;
        titleElement.textContent = film.title;
        runtimeElement.textContent = `${film.runtime} minutes`;
        filmInfoElement.textContent = film.description; // 
        showtimeElement.textContent = film.showtime;

        const ticketsAvailable = film.capacity - film.tickets_sold;
        ticketNumElement.textContent = `${ticketsAvailable} remaining tickets`;

        // UPDATES ON THE MOVIES TICKET
        if (ticketsAvailable > 0) {
            buyTicketButton.textContent = 'Buy Ticket';
            buyTicketButton.disabled = false;
            buyTicketButton.onclick = () => buyTicket(film);
        } else {
            buyTicketButton.textContent = 'Sold Out';
            buyTicketButton.disabled = true;
            const soldOutFilm = [...filmListElement.children].find(li => li.textContent.includes(film.title));
            if (soldOutFilm) soldOutFilm.classList.add('sold-out');
        }
    }

    function buyTicket(film) {
        if (film.tickets_sold < film.capacity) {
            fetch(`http://localhost:3000/films/${film.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tickets_sold: film.tickets_sold + 1 })
            })
                .then(response => response.json())
                .then(updatedFilm => {
                    displayFilmDetails(updatedFilm);
                    return fetch('http://localhost:3000/tickets', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            film_id: updatedFilm.id,
                            number_of_tickets: 1
                        })
                    });
                })
                .then(response => response.json())
                .then(data => console.log("Ticket purchased:", data))
                .catch(error => {
                    console.error("Error buying ticket:", error);
                });
        }
    }
    // for deleteion of the movies
    function deleteFilm(filmId, listItem) {
        fetch(`http://localhost:3000/films/${filmId}`, {
            method: 'DELETE'
        })
            .then(() => {
                listItem.remove();
                const nextFilm = filmListElement.querySelector('li:first-child');
                if (nextFilm) {
                    const filmToDisplay = JSON.parse(nextFilm.dataset.film);
                    displayFilmDetails(filmToDisplay);
                } else {
                    resetFilmDetails();
                }
            })
            .catch(error => {
                console.error("Error deleting film:", error);
            });
    }

    function resetFilmDetails() {
        posterElement.src = 'assets/placeholderImage.png';
        titleElement.textContent = '[MOVIE TITLE]';
        runtimeElement.textContent = '[RUNTIME] minutes';
        filmInfoElement.textContent = '[INSERT MOVIE DESCRIPTION HERE]';
        showtimeElement.textContent = '[SHOWTIME]';
        ticketNumElement.textContent = '[X] remaining tickets';
        buyTicketButton.textContent = 'Buy Ticket';
        buyTicketButton.disabled = true;
    }
};

// Wait for DOM content to load before initializing
document.addEventListener("DOMContentLoaded", init);
