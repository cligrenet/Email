document.addEventListener('DOMContentLoaded', function () {
	// Use buttons to toggle between views
	document
		.querySelector('#inbox')
		.addEventListener('click', () => load_mailbox('inbox'));
	document
		.querySelector('#sent')
		.addEventListener('click', () => load_mailbox('sent'));
	document
		.querySelector('#archived')
		.addEventListener('click', () => load_mailbox('archive'));
	document.querySelector('#compose').addEventListener('click', compose_email);

	// Create one email details container (in addition to emails view and compose view)
	const one_email_view = document.createElement('div');
	one_email_view.setAttribute('id', 'one-email-view');
	document.querySelector('.container').append(one_email_view);

	// By default, load the inbox
	load_mailbox('inbox');
});

let currentMailbox;

function compose_email() {
	// Show compose view and hide other views
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'block';
	document.querySelector('#one-email-view').style.display = 'none';

	// Clear out composition fields
	document.querySelector('#compose-recipients').value = '';
	document.querySelector('#compose-subject').value = '';
	document.querySelector('#compose-body').value = '';

	// Remove form submit default behavior
	document
		.querySelector('#compose-form')
		.addEventListener('submit', (event) => {
			event.preventDefault();
		});

	// Add event listener to submit button
	document
		.querySelector('#btn-send-email')
		.addEventListener('click', send_email);
}

function load_mailbox(mailbox) {
	currentMailbox = mailbox;

	// Show the mailbox and hide other views
	document.querySelector('#emails-view').style.display = 'block';
	document.querySelector('#compose-view').style.display = 'none';
	document.querySelector('#one-email-view').style.display = 'none';

	// Show the mailbox name
	document.querySelector('#emails-view').innerHTML = `<h3>${
		mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
	}</h3>`;

	// Load emails in each mailbox
	fetch(`/emails/${mailbox}`)
		.then((response) => response.json())
		.then((data) => {
			// console.log(data);
			// Create emails container
			const emails_container = document.createElement('div');
			// Loop over data and append each email row into container
			data.forEach((d) => {
				const email_row_container = document.createElement('div');
				email_row_container.innerHTML = `<span class='email_row_sender'>${d.sender}</span>  ${d.subject} <span class='email_row_timestamp'>${d.timestamp}</span>`;
				email_row_container.className = 'email_row';
				email_row_container.addEventListener('click', () => {
					view_email(d.id);
					fetch(`/emails/${d.id}`, {
						method: 'PUT',
						body: JSON.stringify({
							read: true,
						}),
					});
				});
				// Change email row background color
				d.read
					? (email_row_container.style.backgroundColor = 'lightgray')
					: (email_row_container.style.backgroundColor = 'white');
				emails_container.append(email_row_container);
			});
			document.querySelector('#emails-view').append(emails_container);
		})
		.catch((err) => console.log(err));
}

function send_email() {
	// Make a POST request on emails page, submit email composition form
	fetch('/emails', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			recipients: document.querySelector('#compose-recipients').value,
			subject: document.querySelector('#compose-subject').value,
			body: document.querySelector('#compose-body').value,
		}),
	})
		.then((response) => response.json())
		.then(() => load_mailbox('sent'))
		.catch((err) => console.log(`Error: ${err}`));
}

function view_email(email_id) {
	// Hide emails view, show one email view
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'none';
	document.querySelector('#one-email-view').style.display = 'block';
	// Clean previous email data
	document.querySelector('#one-email-view').innerHTML = '';

	// Load one email details
	fetch(`/emails/${email_id}`)
		.then((response) => response.json())
		.then((data) => {
			// console.log(data);
			// Create one email container, insert info and attach it to one email view
			const one_email_container = document.createElement('div');
			let html = `<div><b>From:</b> ${data.sender}</div> <div><b>To:</b> ${data.recipients}</div> <div><b>Subject:</b> ${data.subject}</div> <div><b>Timestamp:</b> ${data.timestamp}</div>`;

			// If in sent box, hide archive button
			if (currentMailbox !== 'sent') {
				html += `<button id='btn-unread' class='btn btn-sm btn-outline-secondary'>Unread</button> <button id='btn-reply' class='btn btn-sm btn-outline-primary'>Reply</button> <button id='btn-archive' class='btn btn-sm btn-outline-success'>${
					data.archived == true ? 'Unarchive' : 'Archive'
				}
				</button>`;
			}
			html += `<hr><div>${data.body}</div>`;
			one_email_container.innerHTML = html;

			document
				.querySelector('#one-email-view')
				.append(one_email_container);

			// Add event listener to unread button
			document
				.querySelector('#btn-unread')
				.addEventListener('click', () => {
					fetch(`/emails/${email_id}`, {
						method: 'PUT',
						body: JSON.stringify({
							// toggle read
							read: !data.read,
						}),
					}).then(() => load_mailbox('inbox'));
				});

			// Add event listener to archive button
			if (document.querySelector('#btn-archive')) {
				document
					.querySelector('#btn-archive')
					.addEventListener('click', () => {
						fetch(`/emails/${email_id}`, {
							method: 'PUT',
							body: JSON.stringify({
								// toggle archive, always the opposite of current value
								archived: !data.archived,
							}),
						}).then(() => load_mailbox('inbox'));
					});
			}

			// Add event listener to reply button
			if (document.querySelector('#btn-reply')) {
				document
					.querySelector('#btn-reply')
					.addEventListener('click', () => {
						// Show compose view and hide other views
						document.querySelector('#emails-view').style.display =
							'none';
						document.querySelector(
							'#one-email-view'
						).style.display = 'none';
						document.querySelector('#compose-view').style.display =
							'block';

						// Prefill reply email
						document.querySelector('#compose-recipients').value =
							data.sender;
						document.querySelector('#compose-subject').value =
							data.subject.includes('Re')
								? `${data.subject}`
								: `Re: ${data.subject}`;
						document.querySelector(
							'#compose-body'
						).value = `\n>>>>> On ${data.timestamp} ${data.sender} wrote: \n${data.body}`;

						// Remove form submit default behavior
						document
							.querySelector('#compose-form')
							.addEventListener('submit', (event) => {
								event.preventDefault();
							});

						// Add event listener to submit button
						document
							.querySelector('#btn-send-email')
							.addEventListener('click', send_email);
					});
			}
		})
		.catch((err) => console.log(err));
}
