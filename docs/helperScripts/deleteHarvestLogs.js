// run this script in the console to quickly clear out all
// Harvest logs from the current day, day view

editEntry = () => $('button.js-edit-entry').first().click();
deleteEntry = () => $('button.js-delete-entry').first().click();
confirmDeleteEntry = () => $('button.js-confirm-delete-entry').first().click();

deleteFn = () => {
    editEntry();
    deleteEntry();
    confirmDeleteEntry();
};

loop = setInterval(() => {
    editButton = $('button.js-edit-entry').first();
    if (!editButton[0]) {
        clearInterval(loop);
        return;
    }

    deleteFn();
}, 500);